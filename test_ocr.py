import requests

def test_ocr():
    # Provide a tiny base64 encoded image to test
    dummy_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    payload = {
        'apikey': 'helloworld',
        'base64Image': dummy_b64,
        'language': 'eng'
    }
    try:
        response = requests.post('https://api.ocr.space/parse/image', data=payload, timeout=15)
        print("Status Code:", response.status_code)
        res_json = response.json()
        print("Response:", res_json)
    except Exception as e:
        print("Error:", e)

test_ocr()
