/* Root composition */
"use strict";

function App() {
  return React.createElement(
    "div",
    { className: "bg-midnight" },
    React.createElement(Header, null),
    React.createElement(
      "main",
      null,
      React.createElement(Hero, null),
      React.createElement(TrustBar, null),
      React.createElement(About, null),
      React.createElement(Products, null),
      React.createElement(Markets, null),
      React.createElement(Testimonials, null),
      React.createElement(Stockist, null)
    ),
    React.createElement(Footer, null),
    React.createElement(WhatsappFloat, null)
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App, null));