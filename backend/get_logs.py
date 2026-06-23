import subprocess
out = subprocess.run("npx.cmd vercel logs backend-theta-six-87.vercel.app --scope thaiminhquan505-1161s-projects -n 50", capture_output=True, text=True, shell=True)
print("STDOUT:", out.stdout[-2000:])
print("STDERR:", out.stderr[-2000:])
