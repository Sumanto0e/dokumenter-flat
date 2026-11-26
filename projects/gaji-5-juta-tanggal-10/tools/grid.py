import sys
from PIL import Image
fs=sys.argv[2:]; out=sys.argv[1]
ims=[Image.open(f'out/t{f}.png').resize((640,360)) for f in fs]
cols=3; rows=(len(ims)+2)//3
m=Image.new('RGB',(640*cols,360*rows),'white')
for i,im in enumerate(ims): m.paste(im,((i%3)*640,(i//3)*360))
m.save(out)
