import pika


def fix_queue():
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host="localhost")
        )
        channel = connection.channel()
        channel.queue_delete(queue="analytics_queue")
        print("✅ Deleted analytics_queue")
        channel.close()
        connection.close()
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    fix_queue()
