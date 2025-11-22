"""
Quick API Test Example
Run this after starting the server to test all endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_api():
    print("=" * 60)
    print("MediTrack-AI Authentication API Test")
    print("=" * 60)
    
    # Test 1: Register a patient
    print("\n1. Registering a new patient...")
    register_data = {
        "full_name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "+1234567890",
        "password": "securepass123",
        "role": "patient"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        print("✅ Registration successful!")
        print(json.dumps(response.json(), indent=2))
    else:
        print("❌ Registration failed!")
        print(response.json())
        return
    
    # Test 2: Login
    print("\n2. Logging in...")
    login_data = {
        "email": "jane.smith@example.com",
        "password": "securepass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Login successful!")
        token_data = response.json()
        access_token = token_data["access_token"]
        print(f"Token: {access_token[:50]}...")
    else:
        print("❌ Login failed!")
        print(response.json())
        return
    
    # Test 3: Get current user
    print("\n3. Getting current user info...")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Successfully retrieved user info!")
        print(json.dumps(response.json(), indent=2))
    else:
        print("❌ Failed to get user info!")
        print(response.json())
        return
    
    # Test 4: Try without token (should fail)
    print("\n4. Testing without token (should fail)...")
    response = requests.get(f"{BASE_URL}/auth/me")
    print(f"Status: {response.status_code}")
    if response.status_code == 401:
        print("✅ Correctly rejected request without token!")
    else:
        print("❌ Should have rejected!")
    
    print("\n" + "=" * 60)
    print("All tests completed successfully! ✅")
    print("=" * 60)


if __name__ == "__main__":
    try:
        # Test if server is running
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            test_api()
        else:
            print("❌ Server is not responding correctly!")
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to server!")
        print("Make sure the server is running:")
        print("  python main.py")
