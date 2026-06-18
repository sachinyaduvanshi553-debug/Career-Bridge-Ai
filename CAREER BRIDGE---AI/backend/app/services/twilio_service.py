import os
import random
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Initialize client only if SID is configured
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
else:
    client = None

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def send_otp_sms(phone_number: str, otp: str) -> bool:
    if not client:
        print(f"[MOCK OTP]: Sending OTP {otp} to {phone_number} (Twilio not configured in .env)")
        return True # Default to mock success if not configured
    try:
        message = client.messages.create(
            body=f"Your CAREER BRIDGE - AI verification code is: {otp}. It is valid for 10 minutes.",
            from_=TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        print(f"OTP sent successfully: {message.sid}")
        return True
    except Exception as e:
        print(f"Error sending SMS via Twilio: {e}")
        return False
