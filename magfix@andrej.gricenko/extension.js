const Meta = imports.gi.Meta;
const Clutter = imports.gi.Clutter;
const Magnifier = imports.ui.magnifier;

let Main = imports.ui.main;

let _zoomRegions;
let _mouseSprite;
let createZoomRegion;

function init() {}

function enable() {
    let magnifierActive = Main.magnifier.isActive();
    Main.magnifier.setActive(false);

    _zoomRegions = Main.magnifier._zoomRegions;
    _mouseSprite = Main.magnifier._mouseSprite;
    createZoomRegion = Main.magnifier.createZoomRegion;

    Magnifier.Magnifier.prototype.createZoomRegion = (xMagFactor, yMagFactor, roi, viewPort) => {
        let zoomRegion = new ZoomRegion(this, this._cursorRoot);
        zoomRegion.setViewPort(viewPort);

        // We ignore the redundant width/height on the ROI
        let fixedROI = Object.create(roi);
        fixedROI.width = viewPort.width / xMagFactor;
        fixedROI.height = viewPort.height / yMagFactor;
        zoomRegion.setROI(fixedROI);

        zoomRegion.addCrosshairs(this._crossHairs);
        return zoomRegion;
    }
    
    Main.magnifier._zoomRegions = [];

    Main.magnifier._mouseSprite = new Clutter.Actor({ request_mode: Clutter.RequestMode.CONTENT_SIZE });
    Main.magnifier._mouseSprite.content = new Magnifier.MouseSpriteContent();

    Main.magnifier._cursorRoot = new Clutter.Actor()
    Main.magnifier._cursorRoot.add_actor(Main.magnifier._mouseSprite);

    [Main.magnifier.xMouse, Main.magnifier.yMouse] = global.get_pointer();

    let aZoomRegion = new Magnifier.ZoomRegion(Main.magnifier, Main.magnifier._cursorRoot);
    Main.magnifier._zoomRegions.push(aZoomRegion);
    Main.magnifier._settingsInit(aZoomRegion);
    aZoomRegion.scrollContentsTo(Main.magnifier.xMouse, Main.magnifier.yMouse);
    
    if (magnifierActive) {
        Main.magnifier.setActive(true);
    }
}

function disable() {
    let magnifierActive = Main.magnifier.isActive();
    Main.magnifier.setActive(false);

    Main.magnifier._zoomRegions = _zoomRegions;
    Main.magnifier._mouseSprite = _mouseSprite;
    Main.magnifier.createZoomRegion = createZoomRegion;
  
    if (magnifierActive) {
        Main.magnifier.setActive(true);
    }
}
