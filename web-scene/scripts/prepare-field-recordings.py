"""Prepare licensed field recordings without synthetic layers.
Usage: python prepare-field-recordings.py /path/to/blanket-ogg-files
Sources, licenses and upstream revision: src/audio/README.md.
Requires NumPy and ffmpeg. Only excerpting, level matching and a loop crossfade.
"""
from pathlib import Path
import sys,subprocess,tempfile,wave
import numpy as np
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1]);output=root/'src/audio'
SR=32000
for original,name,start,duration in [('rain','rain',8,75),('birds','forest',5,95),('summer-night','crickets',0,49),('fireplace','fireplace',0,25),('coffee-shop','cafe',0,16.6)]:
    raw=subprocess.check_output(['ffmpeg','-v','error','-ss',str(start),'-i',str(source/(original+'.ogg')),'-t',str(duration),'-ar',str(SR),'-ac','2','-f','f32le','-'])
    x=np.frombuffer(raw,dtype='<f4').reshape(-1,2).copy()
    # Move the 1.5 second boundary inside the loop with an equal-power overlap.
    k=int(1.5*SR);phase=np.linspace(0,np.pi/2,k)[:,None]
    join=x[-k:]*np.cos(phase)+x[:k]*np.sin(phase)
    x=np.concatenate([x[k:-k],join])
    gain=min(.065/np.sqrt(np.mean(x*x)),.5/np.max(abs(x)))
    x*=gain
    with tempfile.TemporaryDirectory() as temp:
        path=Path(temp)/'loop.wav'
        with wave.open(str(path),'wb') as f:
            f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((x*32767).astype('<i2').tobytes())
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(path),'-c:a','libmp3lame','-q:a','2','-map_metadata','-1',str(output/(name+'-recorded.mp3'))],check=True)
    print(name,round(len(x)/SR,2),'seconds; gain',round(20*np.log10(gain),2),'dB; peak',round(20*np.log10(np.max(abs(x))),2),'dBFS')
