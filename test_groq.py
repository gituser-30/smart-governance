import os
import asyncio
from groq import AsyncGroq

async def test():
    client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
    try:
        completion = await client.chat.completions.create(
            model="llama-3.2-11b-vision",
            messages=[{
                "role": "user",
                "content": [{"type": "text", "text": "hello"}]
            }]
        )
        print("Success:", completion.choices[0].message.content)
    except Exception as e:
        print("Error details:", str(e))

asyncio.run(test())
