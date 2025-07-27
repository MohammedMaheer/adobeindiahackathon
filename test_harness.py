import os
import subprocess
import time
import json

def run_cmd(cmd):
    print(f"Running: {cmd}")
    start = time.time()
    result = subprocess.run(cmd, shell=True, capture_output=True)
    elapsed = time.time() - start
    print(f"Elapsed: {elapsed:.2f}s")
    if result.returncode != 0:
        print("Error:", result.stderr.decode())
    return elapsed, result

def test_round1a():
    os.makedirs("input", exist_ok=True)
    os.makedirs("output", exist_ok=True)
    # Copy sample PDF if available
    if not any(f.endswith('.pdf') for f in os.listdir("input")):
        print("[!] Please add at least one PDF to the input/ directory.")
        return False
    elapsed, _ = run_cmd(
        "docker run --rm -v $(pwd)/input:/app/input -v $(pwd)/output:/app/output adobe-hackathon"
    )
    jsons = [f for f in os.listdir("output") if f.endswith('.json')]
    if not jsons:
        print("[!] No output JSONs found. Round 1A failed.")
        return False
    print(f"[+] Round 1A completed in {elapsed:.2f}s. Output files: {jsons}")
    return True

def test_round1b():
    os.makedirs("output", exist_ok=True)
    jsons = [f for f in os.listdir("output") if f.endswith('.json') and not f.endswith('challenge1b_output.json')]
    if not jsons:
        print("[!] No input JSONs for Round 1B. Run Round 1A first.")
        return False
    persona = "A Japanese high school teacher"
    job = "Find sections about digital education tools"
    elapsed, _ = run_cmd(
        f"docker run --rm -v $(pwd)/output:/app/output adobe-hackathon "
        f"python round1b_persona_intelligence.py --input /app/output --output /app/output "
        f"--persona '{persona}' --job '{job}'"
    )
    out_jsons = [f for f in os.listdir("output") if f.endswith('challenge1b_output.json')]
    if not out_jsons:
        print("[!] No output from Round 1B.")
        return False
    print(f"[+] Round 1B completed in {elapsed:.2f}s. Output files: {out_jsons}")
    return True

if __name__ == "__main__":
    print("=== TEST HARNESS FOR ADOBE HACKATHON PROJECT ===")
    ok1 = test_round1a()
    if ok1:
        ok2 = test_round1b()
        if ok2:
            print("[✓] All tests passed. Ready for submission!")
        else:
            print("[!] Round 1B failed.")
    else:
        print("[!] Round 1A failed. Fix errors and retry.")
