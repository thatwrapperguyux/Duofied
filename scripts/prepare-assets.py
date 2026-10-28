"""Prepare the Apple reference assets locally; they are not part of the MIT-licensed source."""

import sys
from pathlib import Path
from shutil import copyfile
from urllib.error import URLError
from urllib.request import urlretrieve
from zipfile import ZipFile


def fetch(url, target, what, required=True):
    """Download one asset, saying plainly which one failed and why."""
    print(f"Downloading {what}...", flush=True)
    try:
        urlretrieve(url, target)
    except (URLError, OSError) as error:
        message = f"Could not download {what} from {url}\n  {error}"
        if required:
            sys.exit(f"{message}\n"
                     "The reference model is required for this build. Check that the build "
                     "environment can reach apple.com, or deploy without this step to use the "
                     "built-in device instead.")
        print(f"  skipped: {error}", flush=True)
        return False
    return True

from pxr import Sdf, Usd


assets = Path(__file__).resolve().parents[1] / "assets"
textures = assets / "textures"
ui = assets / "ui"
textures.mkdir(parents=True, exist_ok=True)
ui.mkdir(parents=True, exist_ok=True)

model = assets / "iPhone_Duo_Star_White.usdz"
model_url = "https://www.apple.com/105/media/us/iphone-duo/2026/9305e4b9-72d9-4c05-9381-b572adadd5e5/ar/iPhone_Duo_e-sim_Star-White_Variant.usdz"
if not model.exists():
    fetch(model_url, model, "the Apple reference model")

with ZipFile(model) as archive:
    for name in archive.namelist():
        if Path(name).suffix.lower() in {".png", ".jpg", ".jpeg", ".avif"}:
            (textures / Path(name).name).write_bytes(archive.read(name))

print("Preparing the unfolded pose...", flush=True)
stage = Usd.Stage.Open(str(model))
stage.GetDefaultPrim().GetVariantSet("Pose").SetVariantSelection("Landscape")
flattened = Usd.Stage.Open(stage.Flatten())
for prim in flattened.Traverse():
    for attribute in prim.GetAttributes():
        value = attribute.Get()
        if isinstance(value, Sdf.AssetPath) and value.path:
            # Flattening resolves USDZ references to package paths; use local texture paths for the browser.
            filename = Path(value.path.split("[")[-1].rstrip("]")).name
            attribute.Set(Sdf.AssetPath(f"textures/{filename}"))
model_render = assets / "iPhone_Duo_Render.usdc"
flattened.GetRootLayer().Export(str(model_render))

copyfile(textures / "bRLlvSMXjHGTFMA.avif", ui / "wallpaper-inner.avif")

clock_base = "https://www.apple.com/v/iphone-duo/a/static/uploads/dIFKSKvliUSYOBw/MszYeqEKDgnBqxc/CRqwzvoYesuhNwK"
hig_base = "https://developer.apple.com/tutorials/images/com.apple.HIG"
ui_sources = {
    "clock-inner.avif": f"{clock_base}/lockscreen_ui_inner-wallpaper_png.avif",
    "clock-outer.avif": f"{clock_base}/lockscreen_ui_outer-wallpaper_png.avif",
    "launcher-inner.png": f"{hig_base}/designing-for-iphone-hero-inside@2x.png",
    "launcher-outer.png": f"{hig_base}/designing-for-iphone-hero-outside@2x.png",
}
# The app draws its own screen layouts when these are missing, so they do not stop a build.
missing = [name for name, url in ui_sources.items() if not fetch(url, ui / name, name, required=False)]
if missing:
    print(f"Screen images unavailable ({', '.join(missing)}); the built-in layouts will be used.", flush=True)

print(f"Model ready at {model_render.relative_to(assets.parent)}", flush=True)
print("Assets ready. Run: python3 -m http.server 8766 --bind 127.0.0.1")
