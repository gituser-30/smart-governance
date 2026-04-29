import os
import asyncio
from groq import AsyncGroq

async def test():
    client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
    try:
        models = await client.models.list()
        with open("models_out.txt", "w", encoding="utf-8") as f:
             for m in models.data:
                  f.write(m.id + "\n")
    except Exception as e:
        print("Error details:", str(e))

asyncio.run(test())
