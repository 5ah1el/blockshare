import requests
import json

IPFS_API = "http://127.0.0.1:5001/api/v0"

def set_ipfs_config(key, value):
    try:
        # The value must be JSON encoded string
        json_value = json.dumps(value)
        params = {
            'arg': [key, json_value],
            'json': 'true'
        }
        response = requests.post(f"{IPFS_API}/config", params=params)
        if response.status_code == 200:
            print(f"Successfully set {key} to {value}")
        else:
            print(f"Failed to set {key}: {response.text}")
    except Exception as e:
        print(f"Error connecting to IPFS API: {str(e)}")

if __name__ == "__main__":
    # Set Allowed Origins
    origins = ["http://localhost:5000", "http://localhost:5173", "http://127.0.0.1:5001"]
    set_ipfs_config("API.HTTPHeaders.Access-Control-Allow-Origin", origins)
    
    # Set Allowed Methods
    methods = ["PUT", "POST", "GET"]
    set_ipfs_config("API.HTTPHeaders.Access-Control-Allow-Methods", methods)
