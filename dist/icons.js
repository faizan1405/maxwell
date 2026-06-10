/* Lucide-style inline icons (MIT). Stroke-based, currentColor. */
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var Icon = function Icon(_ref) {
  var children = _ref.children;
  var _ref$size = _ref.size;
  var size = _ref$size === undefined ? 24 : _ref$size;
  var _ref$className = _ref.className;
  var className = _ref$className === undefined ? "" : _ref$className;
  var _ref$strokeWidth = _ref.strokeWidth;
  var strokeWidth = _ref$strokeWidth === undefined ? 2 : _ref$strokeWidth;

  var rest = _objectWithoutProperties(_ref, ["children", "size", "className", "strokeWidth"]);

  return React.createElement(
    "svg",
    _extends({
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: className,
      "aria-hidden": "true"
    }, rest),
    children
  );
};

var IconMenu = function IconMenu(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("line", { x1: "4", x2: "20", y1: "7", y2: "7" }),
    React.createElement("line", { x1: "4", x2: "20", y1: "12", y2: "12" }),
    React.createElement("line", { x1: "4", x2: "20", y1: "17", y2: "17" })
  );
};
var IconX = function IconX(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M18 6 6 18" }),
    React.createElement("path", { d: "m6 6 12 12" })
  );
};
var IconArrowRight = function IconArrowRight(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M5 12h14" }),
    React.createElement("path", { d: "m12 5 7 7-7 7" })
  );
};
var IconChevronDown = function IconChevronDown(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "m6 9 6 6 6-6" })
  );
};
var IconShieldCheck = function IconShieldCheck(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }),
    React.createElement("path", { d: "m9 12 2 2 4-4" })
  );
};
var IconMapPin = function IconMapPin(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" }),
    React.createElement("circle", { cx: "12", cy: "10", r: "3" })
  );
};
var IconCalendar = function IconCalendar(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M8 2v4" }),
    React.createElement("path", { d: "M16 2v4" }),
    React.createElement("rect", { width: "18", height: "18", x: "3", y: "4", rx: "2" }),
    React.createElement("path", { d: "M3 10h18" })
  );
};
var IconTruck = function IconTruck(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" }),
    React.createElement("path", { d: "M15 18H9" }),
    React.createElement("path", { d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" }),
    React.createElement("circle", { cx: "17", cy: "18", r: "2" }),
    React.createElement("circle", { cx: "7", cy: "18", r: "2" })
  );
};
var IconSparkles = function IconSparkles(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" }),
    React.createElement("path", { d: "M20 3v4" }),
    React.createElement("path", { d: "M22 5h-4" })
  );
};
var IconPhone = function IconPhone(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" })
  );
};
var IconMail = function IconMail(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }),
    React.createElement("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
  );
};
var IconFacebook = function IconFacebook(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" })
  );
};
var IconWhatsapp = function IconWhatsapp(p) {
  return React.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", width: p.size || 24, height: p.size || 24, className: p.className, "aria-hidden": "true" },
    React.createElement("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" })
  );
};
var IconDroplet = function IconDroplet(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" })
  );
};
var IconFactory = function IconFactory(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" }),
    React.createElement("path", { d: "M17 18h1" }),
    React.createElement("path", { d: "M12 18h1" }),
    React.createElement("path", { d: "M7 18h1" })
  );
};
var IconCar = function IconCar(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" }),
    React.createElement("circle", { cx: "7", cy: "17", r: "2" }),
    React.createElement("path", { d: "M9 17h6" }),
    React.createElement("circle", { cx: "17", cy: "17", r: "2" })
  );
};
var IconShirt = function IconShirt(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" })
  );
};
var IconBuilding = function IconBuilding(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" }),
    React.createElement("path", { d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" }),
    React.createElement("path", { d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" }),
    React.createElement("path", { d: "M10 6h4" }),
    React.createElement("path", { d: "M10 10h4" }),
    React.createElement("path", { d: "M10 14h4" }),
    React.createElement("path", { d: "M10 18h4" })
  );
};
var IconHome = function IconHome(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
    React.createElement("polyline", { points: "9 22 9 12 15 12 15 22" })
  );
};
var IconLeaf = function IconLeaf(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" }),
    React.createElement("path", { d: "M2 21c0-3 1.85-5.36 5.08-6" })
  );
};
var IconHeadphones = function IconHeadphones(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" })
  );
};
var IconFlask = function IconFlask(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" }),
    React.createElement("path", { d: "M6.453 15h11.094" }),
    React.createElement("path", { d: "M8.5 2h7" })
  );
};
var IconStar = function IconStar(p) {
  return React.createElement(
    Icon,
    _extends({}, p, { fill: "currentColor", stroke: "none" }),
    React.createElement("path", { d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.69 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.453 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" })
  );
};
var IconCheck = function IconCheck(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M20 6 9 17l-5-5" })
  );
};
var IconCheckCircle = function IconCheckCircle(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M21.801 10A10 10 0 1 1 17 3.335" }),
    React.createElement("path", { d: "m9 11 3 3L22 4" })
  );
};
var IconQuote = function IconQuote(p) {
  return React.createElement(
    Icon,
    _extends({}, p, { fill: "currentColor", stroke: "none" }),
    React.createElement("path", { d: "M9.5 6C6.46 6 4 8.46 4 11.5V18h6.5v-6.5H7.5C7.5 9.84 8.34 9 9.5 9zM19.5 6C16.46 6 14 8.46 14 11.5V18h6.5v-6.5H17.5C17.5 9.84 18.34 9 19.5 9z" })
  );
};
var IconBeaker = function IconBeaker(p) {
  return React.createElement(
    Icon,
    p,
    React.createElement("path", { d: "M4.5 3h15" }),
    React.createElement("path", { d: "M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" }),
    React.createElement("path", { d: "M6 14h12" })
  );
};

Object.assign(window, {
  Icon: Icon, IconMenu: IconMenu, IconX: IconX, IconArrowRight: IconArrowRight, IconChevronDown: IconChevronDown, IconShieldCheck: IconShieldCheck, IconMapPin: IconMapPin,
  IconCalendar: IconCalendar, IconTruck: IconTruck, IconSparkles: IconSparkles, IconPhone: IconPhone, IconMail: IconMail, IconFacebook: IconFacebook, IconWhatsapp: IconWhatsapp,
  IconDroplet: IconDroplet, IconFactory: IconFactory, IconCar: IconCar, IconShirt: IconShirt, IconBuilding: IconBuilding, IconHome: IconHome, IconLeaf: IconLeaf,
  IconHeadphones: IconHeadphones, IconFlask: IconFlask, IconStar: IconStar, IconCheck: IconCheck, IconCheckCircle: IconCheckCircle, IconQuote: IconQuote, IconBeaker: IconBeaker
});