import pika
import time
import os

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RETRIES = 30


def init_rabbitmq():
    print(f"[*] Initializing RabbitMQ Topology on {RABBITMQ_HOST}...")
    connection = None
    for i in range(RETRIES):
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=RABBITMQ_HOST, socket_timeout=5)
            )
            channel = connection.channel()

            # Declare Exchange
            channel.exchange_declare(
                exchange="orders_exchange", exchange_type="fanout", durable=True
            )
            print("   ✅ Exchange Declared: orders_exchange")

            # Declare DLQ
            channel.exchange_declare(
                exchange="dlx_exchange", exchange_type="fanout", durable=True
            )
            channel.queue_declare(queue="analytics_dlq", durable=True)
            channel.queue_bind(exchange="dlx_exchange", queue="analytics_dlq")
            print("   ✅ DLQ Configured: analytics_dlq")

            # Declare Main Queue with DLQ arguments
            args = {
                "x-dead-letter-exchange": "dlx_exchange",
                "x-dead-letter-routing-key": "analytics_dlq",
            }
            channel.queue_declare(queue="analytics_queue", durable=True, arguments=args)
            print("   ✅ Queue Declared: analytics_queue (with DLQ)")

            # Bind
            channel.queue_bind(exchange="orders_exchange", queue="analytics_queue")
            print("   ✅ Binding Created: orders_exchange -> analytics_queue")

            connection.close()
            print("🎉 RabbitMQ Topology Ready.")
            return True

        except pika.exceptions.AMQPConnectionError:
            print(f"   [Retry {i + 1}/{RETRIES}] Waiting for RabbitMQ...")
            time.sleep(2)
        except Exception as e:
            print(f"   ❌ Error: {e}")
            time.sleep(2)

    print("❌ Failed to initialize RabbitMQ Topology.")
    return False


if __name__ == "__main__":
    if not init_rabbitmq():
        exit(1)
