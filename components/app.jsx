/* Root composition */
function App() {
  return (
    <div className="bg-midnight">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <About />
        <Products />
        <Markets />
        <Testimonials />
        <Stockist />
      </main>
      <Footer />
      <WhatsappFloat />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
