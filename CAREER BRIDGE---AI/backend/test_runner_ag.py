import subprocess
import time

print("Starting server...")
with open("test_results.txt", "w") as f:
    f.write("Starting server...\n")
    
server = subprocess.Popen(["python", "-m", "uvicorn", "app.main:app", "--port", "8000"])
time.sleep(7)

with open("test_results.txt", "a") as f:
    f.write("Running tests...\n")
    
test = subprocess.run(["python", "tests/verify_api.py"], capture_output=True, text=True)

with open("test_results.txt", "a") as f:
    f.write("TEST STDOUT:\n")
    f.write(test.stdout)
    f.write("\nTEST STDERR:\n")
    f.write(test.stderr)
    f.write("\nDone.\n")

server.terminate()
