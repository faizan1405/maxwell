/* Amahle Blue Store — data, cart context, primitives */

const BRAND = {
  name: "Amahle Blue",
  tagline: "Cleaning Solutions",
  phone: "067 101 4345",
  phoneRaw: "+27671014345",
  email: "info@amahle-blue.co.za",
  address: "Unit H, 13 Main Reef Road, Dunswart, Boksburg, Gauteng, South Africa",
  wa: "https://wa.me/27671014345",
  facebook: "https://www.facebook.com/share/17sDJXMKSz/",
  instagram: "https://www.instagram.com/amahle_blue/",
};

const CATEGORIES = [
  { id: "household", name: "Household Cleaning", short: "Household", icon: "Home", blurb: "Everyday surfaces, floors, fabrics & fresh-smelling rooms.", accent: "#1D4ED8" },
  { id: "industrial", name: "Industrial Products", short: "Industrial", icon: "Spray", blurb: "Heavy-duty degreasers, cleaners and specialty solutions for industrial use.", accent: "#B45309" },
  { id: "car", name: "Car Care", short: "Car Care", icon: "Car", blurb: "Showroom shine for tyres, dashboards & trim.", accent: "#0B2E6B" },
  { id: "car-exterior", name: "Car Exterior", short: "Car Exterior", icon: "Car", blurb: "Tar removers, bumper black, chassis coatings & exterior detailing.", accent: "#1E3A5F" },
  { id: "sanitiser", name: "Sanitisers & Disinfectants", short: "Sanitisers", icon: "Shield", blurb: "High-purity protection that kills 99.9% of germs.", accent: "#159A4C" },
];

const PRODUCTS_DEFAULT = [
  {
    id: "all-purpose-cleaner", name: "All Purpose Cleaner", cat: "household",
    sub: "Versatile Multi-Surface Cleaning Solution", price: 89.99, was: 109.99,
    size: "500ml", rating: 4.8, reviews: 124, badge: "Bestseller",
    img: (window.__resources||{}).allPurposeCleaner || "assets/products/all-purpose-cleaner.jpg",
    benefits: ["Cuts grease & grime", "Cleans kitchens, bathrooms & counters", "Leaves surfaces fresh & streak-free", "Safe on tiles, stainless steel & sealed surfaces"],
    desc: "A versatile multi-surface cleaning solution designed to cut through grease, dirt and grime — leaving every washable surface sparkling clean and fresh every time.",
    scent: "Fresh Clean",
  },
  {
    id: "tile-cleaner", name: "Tile Cleaner", cat: "household",
    sub: "Powerful Floor & Tile Cleaning Solution", price: 94.99,
    size: "5L", rating: 4.7, reviews: 98, badge: null,
    img: (window.__resources||{}).tileCleaner || "assets/products/tile-cleaner.jpg",
    benefits: ["Removes tough stains", "Cuts grease & grime", "Fresh clean finish", "Suitable for ceramic & porcelain tiles"],
    desc: "Powerful cleaning solution formulated to remove tough stains, dirt, grease and soap scum from floor and wall tiles — leaving surfaces sparkling with a fresh finish.",
    scent: "Sparkling Fresh",
  },
  {
    id: "carpet-upholstery-shampoo", name: "Carpet & Upholstery Shampoo", cat: "household",
    sub: "Deep Cleaning Fabric & Carpet Care", price: 129.99, was: 149.99,
    size: "5L", rating: 4.9, reviews: 76, badge: "Bestseller",
    img: (window.__resources||{}).carpetShampoo || "assets/products/carpet-upholstery-shampoo.png",
    benefits: ["Lifts dirt & stubborn stains", "Refreshes carpets & upholstery", "Low-foam fresh clean finish", "Suitable for rugs, sofas & fabric seats"],
    desc: "A powerful shampoo specially formulated to remove dirt, stains and embedded grime from carpets, rugs and upholstered surfaces — leaving them cleaner, brighter and fresh-smelling.",
    scent: "Fresh Linen",
  },
  {
    id: "linen-spray", name: "Linen Spray", cat: "household",
    sub: "Fresh Linen Fragrance & Fabric Refresh", price: 99.99,
    size: "500ml", rating: 4.8, reviews: 61, badge: "New",
    img: (window.__resources||{}).linenSpray || "assets/products/linen-spray.jpg",
    benefits: ["Refreshes linen & fabrics instantly", "Helps neutralize unwanted odours", "Long-lasting fresh scent", "For bedding, curtains & upholstery"],
    desc: "A fabric freshening spray formulated to refresh linen, bedding, curtains and soft furnishings — eliminating odours while leaving fabrics smelling clean, crisp and pleasantly fresh.",
    scent: "Fresh Linen",
  },
  {
    id: "hand-surface-sanitiser", name: "Hand & Surface Sanitiser", cat: "sanitiser",
    sub: "Isopropyl Alcohol 85% — Kills 99.9% of germs", price: 149.99,
    size: "5L", rating: 4.9, reviews: 210, badge: "Bestseller",
    img: (window.__resources||{}).handSanitiser || "assets/products/hand-surface-sanitiser.jpg",
    benefits: ["Kills 99.9% of germs & bacteria", "Fast drying & non-sticky", "No-rinse formula", "Surface friendly"],
    desc: "High-strength hand and surface sanitiser formulated with 85% Isopropyl Alcohol to kill 99.9% of germs and bacteria. Fast-drying and non-sticky — suitable for hands and a wide range of hard surfaces.",
    scent: "85% IPA",
  },
  {
    id: "isopropyl-alcohol", name: "Isopropyl Alcohol 99.99%", cat: "sanitiser",
    sub: "Fast Drying Cleaning & Disinfecting Solution", price: 179.99, was: 199.99,
    size: "5L", rating: 4.9, reviews: 143, badge: "High Purity",
    img: (window.__resources||{}).isopropylAlcohol || "assets/products/isopropyl-alcohol.jpg",
    benefits: ["Quick evaporation & fast drying", "Removes grease, dirt & residue", "Safe for glass, electronics & equipment", "Leaves a clean streak-free finish"],
    desc: "A fast-evaporating 99.99% Isopropyl Alcohol cleaning solution that removes grease, grime and residue from hard surfaces and equipment — drying quickly without leaving heavy residue.",
    scent: "99.99% IPA",
  },
  {
    id: "tyre-shine", name: "Tyre Shine", cat: "car",
    sub: "Deep Black Shine & Long-Lasting Protection", price: 119.99,
    size: "5L", rating: 4.7, reviews: 88, badge: null,
    img: (window.__resources||{}).tyreShine || "assets/products/tyre-shine.jpg",
    benefits: ["Restores deep black tyre finish", "Instant glossy shine", "Helps protect against cracking & fading", "Repels dust & road grime"],
    desc: "A premium tyre dressing formulated to restore a rich black appearance and a clean, glossy finish — enhancing the look of tyres while protecting against dryness, dullness and everyday road grime.",
    scent: "Gloss Finish",
  },
  {
    id: "tyre-dash-shine", name: "Tyre & Dash Shine", cat: "car",
    sub: "High Gloss Tyre & Dashboard Care", price: 124.99,
    size: "5L", rating: 4.8, reviews: 72, badge: "New",
    img: (window.__resources||{}).tyreDashShine || "assets/products/tyre-dash-shine.jpg",
    benefits: ["Restores shine to tyres & dashboards", "Helps protect against dust & fading", "Rich, non-greasy finish", "For tyres, dashboards & vinyl trim"],
    desc: "A quality car-care formula designed to clean, shine and refresh tyres, dashboards and vinyl or plastic surfaces — restoring a neat, glossy appearance that looks well maintained.",
    scent: "High Gloss",
  },
  {
    id: "wash-up-liquid-green", name: "Wash-Up Liquid (Green)", cat: "household",
    sub: "Heavy-Duty Dishwashing & Degreasing Liquid", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/wash-up-liquid-green.jpg",
    benefits: ["Cuts through grease fast", "Rich lather formula", "Gentle on hands", "For dishes, pots & surfaces"],
    desc: "A powerful green dishwashing liquid formulated to cut through grease and food residue — leaving dishes, pots and kitchen surfaces clean and fresh with minimal effort.",
    scent: "Fresh Green",
  },
  {
    id: "sanitizers", name: "Sanitizers", cat: "household",
    sub: "Multi-Surface Sanitizing Solution", price: 0,
    size: "5L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/sanitizers.jpg",
    benefits: ["Kills germs & bacteria", "Safe on hard surfaces", "Quick-drying formula", "No harsh residue"],
    desc: "A reliable sanitizing solution for everyday use on hard surfaces — effectively eliminating germs, bacteria and common pathogens to keep your home clean and safe.",
    scent: "Clean Fresh",
  },
  {
    id: "sani-pine", name: "Sani-Pine", cat: "household",
    sub: "Pine-Scented Disinfectant Cleaner", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/sani-pine.jpg",
    benefits: ["Disinfects & deodorises", "Classic pine fragrance", "Kills household germs", "For floors, toilets & hard surfaces"],
    desc: "A pine-scented disinfectant cleaner that sanitises and deodorises floors, toilets and hard surfaces — leaving behind a fresh, clean pine fragrance.",
    scent: "Pine Fresh",
  },
  {
    id: "floor-shine-high-traffic", name: "Floor Shine High Traffic", cat: "household",
    sub: "High-Gloss Floor Polish for Heavy-Use Areas", price: 0,
    size: "5L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/floor-shine-high-traffic.jpg",
    benefits: ["High-gloss mirror finish", "Durable in heavy traffic areas", "Protects & seals floor surfaces", "Suitable for vinyl, tiles & linoleum"],
    desc: "A premium floor polish specially formulated for high-traffic areas — delivering a brilliant, long-lasting gloss finish while protecting floor surfaces from daily wear and scuffing.",
    scent: null,
  },
  {
    id: "shower-gel", name: "Shower Gel", cat: "household",
    sub: "Gentle Moisturising Body Wash", price: 0,
    size: "500ml", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/shower-gel.jpg",
    benefits: ["Rich lather & smooth rinse", "Moisturises skin", "Pleasant fragrance", "Gentle on all skin types"],
    desc: "A gentle, moisturising shower gel formulated with a rich lather that cleanses the skin effectively while leaving it feeling soft, smooth and refreshed.",
    scent: "Fresh Breeze",
  },
  {
    id: "sulphuric-acid", name: "Sulphuric Acid", cat: "household",
    sub: "Drain & Blockage Clearing Solution", price: 0,
    size: "5L", rating: 4.6, reviews: 0, badge: null,
    img: "assets/products/sulphuric-acid.jpg",
    benefits: ["Clears blocked drains fast", "Breaks down organic blockages", "Industrial strength formula", "For drains, sewers & pipes"],
    desc: "A high-strength sulphuric acid solution for clearing blocked drains and removing organic build-up in pipes and sewers. Use with caution — follow safety instructions carefully.",
    scent: null,
  },
  {
    id: "toilet-bowl-cleaner", name: "Toilet Bowl Cleaner", cat: "household",
    sub: "Powerful Toilet Disinfectant & Descaler", price: 0,
    size: "5L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/toilet-bowl-cleaner.jpg",
    benefits: ["Removes limescale & stains", "Disinfects & deodorises", "Clings to bowl surface", "Fresh clean scent"],
    desc: "A powerful toilet bowl cleaner that removes limescale, stains and bacteria — disinfecting and deodorising the bowl while leaving a fresh, clean scent.",
    scent: "Clean Citrus",
  },
  {
    id: "thick-bleach", name: "Thick Bleach (Domestos Type)", cat: "household",
    sub: "Heavy-Duty Thick Bleach Disinfectant", price: 0,
    size: "5L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/thick-bleach.jpg",
    benefits: ["Kills 99.9% of germs", "Thick formula clings to surfaces", "Whitens & disinfects", "For toilets, drains & hard surfaces"],
    desc: "A thick, heavy-duty bleach disinfectant that clings to surfaces for extended contact time — killing 99.9% of germs, whitening surfaces and eliminating tough stains and odours.",
    scent: "Clean Bleach",
  },
  {
    id: "oxy-o2", name: "Oxy O2 (Vanish Type)", cat: "household",
    sub: "Oxygen-Powered Stain Remover & Fabric Brightener", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/oxy-o2.jpg",
    benefits: ["Removes tough stains on contact", "Brightens & whitens fabrics", "Oxygen-activated formula", "Safe on colours & whites"],
    desc: "An oxygen-powered stain remover formulated to lift tough stains from fabrics, carpets and surfaces — brightening and refreshing without the harsh effects of chlorine bleach.",
    scent: null,
  },
  {
    id: "industrial-washing-powder", name: "Industrial Washing Powder", cat: "household",
    sub: "Heavy-Duty Laundry Powder for Commercial Use", price: 0,
    size: "25kg", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/industrial-washing-powder.jpg",
    benefits: ["Heavy-duty cleaning power", "For commercial laundry use", "Removes tough stains & grime", "High-foaming formula"],
    desc: "A heavy-duty industrial washing powder designed for commercial and high-volume laundry use — delivering powerful cleaning performance to remove tough stains, grease and grime.",
    scent: "Clean Fresh",
  },
  {
    id: "high-foaming-hand-washing-powder", name: "High Foaming Hand Washing Powder", cat: "household",
    sub: "Premium Hand-Wash Laundry Powder", price: 0,
    size: "5kg", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/high-foaming-hand-washing-powder.jpg",
    benefits: ["High foam for hand washing", "Removes stains effectively", "Gentle on fabrics", "Pleasant fresh scent"],
    desc: "A high-foaming hand washing powder specially formulated for hand laundry — producing a rich lather to lift dirt and stains while remaining gentle on fabrics and skin.",
    scent: "Spring Fresh",
  },
  {
    id: "bio-ultra", name: "Bio Ultra (Bio Classic Type)", cat: "household",
    sub: "Biological Enzyme Laundry Liquid", price: 0,
    size: "5L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/bio-ultra.jpg",
    benefits: ["Enzyme-powered stain removal", "Works in cool wash temperatures", "Breaks down proteins & oils", "Suitable for all fabrics"],
    desc: "A biological enzyme laundry liquid that uses natural enzymes to break down protein-based stains, grease and oils — working effectively even at low wash temperatures.",
    scent: "Fresh Clean",
  },
  {
    id: "metal-polish", name: "Metal Polish", cat: "household",
    sub: "Multi-Metal Shine & Protection Polish", price: 0,
    size: "1L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/metal-polish.jpg",
    benefits: ["Restores shine to all metals", "Removes tarnish & oxidation", "Leaves a protective coating", "For stainless steel, chrome & brass"],
    desc: "A premium metal polish formulated to restore shine and remove tarnish, rust and oxidation from stainless steel, chrome, brass and other metal surfaces — leaving a brilliant finish with protective coating.",
    scent: null,
  },
  {
    id: "mop-and-shine", name: "Mop & Shine", cat: "household",
    sub: "Floor Cleaner & Shine in One", price: 0,
    size: "5L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/mop-and-shine.jpg",
    benefits: ["Cleans & shines in one step", "Long-lasting floor protection", "Pleasant fragrance", "For tiles, vinyl & sealed floors"],
    desc: "A dual-action floor cleaner and shine product that cleans and polishes in a single application — leaving floors sparkling, protected and smelling fresh.",
    scent: "Fresh Citrus",
  },
  {
    id: "pine-gel", name: "Pine Gel", cat: "household",
    sub: "Pine-Scented Heavy-Duty Cleaning Gel", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/pine-gel.jpg",
    benefits: ["Powerful cleaning & disinfection", "Classic pine fragrance", "Gel formula clings to surfaces", "For floors, tiles & bathrooms"],
    desc: "A thick pine-scented cleaning gel that clings to surfaces for deep cleaning and disinfection — leaving a powerful clean and a long-lasting fresh pine fragrance throughout the home.",
    scent: "Pine",
  },
  {
    id: "drain-cleaner", name: "Drain Cleaner", cat: "household",
    sub: "Fast-Acting Drain Unblocking Solution", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/drain-cleaner.jpg",
    benefits: ["Clears blocked drains fast", "Dissolves hair, grease & organic matter", "Works in sinks, showers & baths", "Prevents future blockages"],
    desc: "A fast-acting drain cleaning solution formulated to dissolve hair, grease and organic blockages in sinks, showers and pipes — restoring full drainage quickly and effectively.",
    scent: null,
  },
  {
    id: "fabric-softener", name: "Fabric Softener (Comfort Type)", cat: "household",
    sub: "Long-Lasting Fabric Conditioner & Softener", price: 0,
    size: "5L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/fabric-softener.jpg",
    benefits: ["Softens & conditions fabrics", "Reduces static & wrinkles", "Long-lasting fresh scent", "Suitable for all fabric types"],
    desc: "A premium fabric softener and conditioner that leaves laundry feeling soft, fresh and static-free — delivering long-lasting fragrance and gentle care for all fabric types.",
    scent: "Spring Blossom",
  },
  {
    id: "floor-stripper", name: "Floor Stripper", cat: "household",
    sub: "Heavy-Duty Floor Polish & Wax Remover", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/floor-stripper.jpg",
    benefits: ["Strips old wax & floor polish", "Prepares surfaces for re-polishing", "Fast-acting formula", "Suitable for vinyl, tiles & linoleum"],
    desc: "A powerful floor stripping solution that removes old wax, polish and build-up from hard floor surfaces — preparing them for a fresh application of floor polish or sealer.",
    scent: null,
  },
  {
    id: "furniture-polish", name: "Furniture Polish", cat: "household",
    sub: "Shine & Protect Wood & Furniture Polish", price: 0,
    size: "500ml", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/furniture-polish.jpg",
    benefits: ["Restores shine to wood furniture", "Protects against dust & scratches", "Pleasant fresh wood scent", "For tables, cabinets & shelves"],
    desc: "A quality furniture polish that cleans, shines and protects wood and laminate furniture — restoring a natural lustre while leaving a pleasant fresh scent and a protective barrier.",
    scent: "Fresh Wood",
  },
  {
    id: "hard-surface-cleaner", name: "Hard Surface Cleaner (Handy Andy Type)", cat: "household",
    sub: "All-Purpose Cream Cleaner for Tough Surfaces", price: 0,
    size: "5L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/hard-surface-cleaner.jpg",
    benefits: ["Removes stubborn marks & stains", "Gentle abrasive cream formula", "Safe on most hard surfaces", "For kitchens, bathrooms & appliances"],
    desc: "An all-purpose cream cleaner formulated to remove tough marks, stains and grease from hard surfaces — using a gentle abrasive formula that cleans without scratching kitchens, bathrooms and appliances.",
    scent: "Clean Fresh",
  },
  {
    id: "laundry-liquid", name: "Laundry Liquid (OMO Auto Type)", cat: "household",
    sub: "Automatic Machine Washing Liquid", price: 0,
    size: "5L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/laundry-liquid.jpg",
    benefits: ["For front & top loader machines", "Powerful stain removal", "Fresh clean scent", "Low-foam auto formula"],
    desc: "A concentrated automatic laundry liquid formulated for front and top loader washing machines — delivering powerful stain removal and a long-lasting fresh scent with every wash.",
    scent: "Spring Fresh",
  },
  {
    id: "overall-washing-powder", name: "Overall Washing Powder", cat: "household",
    sub: "Industrial-Strength Laundry Washing Powder", price: 0,
    size: "10kg", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/overall-washing-powder.jpg",
    benefits: ["Industrial cleaning power", "Removes heavy soiling & grease", "High-foaming formula", "For overalls, workwear & heavy fabrics"],
    desc: "A heavy-duty washing powder designed for cleaning overalls, workwear and heavily soiled fabrics — cutting through grease, dirt and industrial grime to deliver a thorough clean.",
    scent: "Clean Fresh",
  },
  {
    id: "bleach-jik-type", name: "Bleach (Jik Type)", cat: "household",
    sub: "Multi-Purpose Household Bleach", price: 0,
    size: "5L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/bleach-jik-type.jpg",
    benefits: ["Whitens & disinfects", "Kills germs & bacteria", "Removes tough stains", "For laundry, toilets & surfaces"],
    desc: "A powerful household bleach that whitens, disinfects and removes tough stains from laundry, toilets and hard surfaces — killing germs and bacteria for a hygienic clean.",
    scent: "Clean Bleach",
  },
  {
    id: "deo-blocks", name: "Deo Blocks", cat: "household",
    sub: "Long-Lasting Toilet & Urinal Deodoriser Blocks", price: 0,
    size: "1kg", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/deo-blocks.jpg",
    benefits: ["Long-lasting fragrance", "Neutralises unpleasant odours", "For toilets & urinals", "Slow-release formula"],
    desc: "Slow-release deodoriser blocks formulated for toilets and urinals — neutralising unpleasant odours and delivering a long-lasting fresh fragrance in bathroom and restroom environments.",
    scent: "Fresh Mint",
  },
  {
    id: "bubble-bath", name: "Bubble Bath", cat: "household",
    sub: "Luxurious Foaming Bubble Bath Formula", price: 0,
    size: "5L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/bubble-bath.jpg",
    benefits: ["Rich, long-lasting bubbles", "Gentle on skin", "Pleasant fragrance", "For adults & children"],
    desc: "A luxurious foaming bubble bath formulated to create a rich, long-lasting lather — gentle on skin with a pleasant fragrance that makes bath time a relaxing and enjoyable experience.",
    scent: "Ocean Fresh",
  },
  {
    id: "dispenser-hand-soap-pink", name: "Dispenser Hand Soap Pink", cat: "household",
    sub: "Gentle Pink Hand Soap for Dispensers", price: 0,
    size: "5L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/dispenser-hand-soap-pink.jpg",
    benefits: ["Gentle & moisturising formula", "For all dispenser types", "Pleasant light fragrance", "Leaves hands soft & clean"],
    desc: "A gentle pink hand soap formulated for soap dispensers in kitchens, bathrooms and commercial settings — effectively cleansing hands while leaving skin feeling soft and fresh.",
    scent: "Light Floral",
  },
  {
    id: "dribrite-floor-shine", name: "Dribrite Floor Shine", cat: "household",
    sub: "High-Gloss Floor Polish & Protector", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/dribrite-floor-shine.jpg",
    benefits: ["High-gloss mirror finish", "Durable floor protection", "Quick-drying formula", "For vinyl, tiles & sealed wood"],
    desc: "A premium floor polish delivering a brilliant high-gloss finish with long-lasting protection — quick-drying and suitable for vinyl, tiles and sealed floor surfaces in homes and commercial spaces.",
    scent: null,
  },
  {
    id: "industrial-overall-washing-powders", name: "Overall Washing Powders", cat: "industrial",
    sub: "Bulk Industrial Laundry Washing Powder", price: 0,
    size: "25kg", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/industrial-overall-washing-powders.jpg",
    benefits: ["Bulk commercial supply", "Removes heavy soiling & grease", "High-foaming formula", "For overalls, workwear & industrial fabrics"],
    desc: "A bulk industrial laundry washing powder available in large quantities — designed for commercial laundromats, factories and industrial facilities requiring high-volume washing power.",
    scent: "Clean Fresh",
  },
  {
    id: "heavy-duty-degreaser", name: "Heavy Duty Degreaser", cat: "industrial",
    sub: "Industrial-Strength Degreasing Solution", price: 0,
    size: "25L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/heavy-duty-degreaser.jpg",
    benefits: ["Removes heavy grease & oils", "Fast-acting penetrating formula", "For machinery, engines & floors", "Dilutable for varied applications"],
    desc: "A powerful industrial-strength degreaser formulated to cut through heavy grease, oil, fuel residue and industrial grime — ideal for use on machinery, engines, workshop floors and industrial equipment.",
    scent: null,
  },
  {
    id: "hd-degreaser", name: "HD Degreaser", cat: "industrial",
    sub: "High-Performance Industrial Degreaser", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/hd-degreaser.jpg",
    benefits: ["High-performance degreasing", "Penetrates tough grease build-up", "Safe on most metals & surfaces", "Suitable for workshops & factories"],
    desc: "An industrial-grade HD degreaser formulated for high-performance grease and oil removal in workshop, factory and manufacturing environments — effective on metals, concrete and most hard surfaces.",
    scent: null,
  },
  {
    id: "nr-solvent-degreaser", name: "NR Solvent Degreaser", cat: "industrial",
    sub: "Non-Residue Solvent-Based Degreaser", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/nr-solvent-degreaser.jpg",
    benefits: ["Leaves no residue after drying", "Fast-evaporating solvent formula", "For precision equipment & electronics", "Removes oils, flux & contaminants"],
    desc: "A non-residue solvent-based degreaser that evaporates cleanly without leaving residue — ideal for degreasing precision equipment, electronics, electrical components and sensitive machinery.",
    scent: null,
  },
  {
    id: "truck-shampoo", name: "Truck Shampoo", cat: "industrial",
    sub: "Heavy-Duty Vehicle & Truck Wash Shampoo", price: 0,
    size: "25L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/truck-shampoo.jpg",
    benefits: ["Removes road grime & diesel soot", "High-foaming concentrate", "Safe on painted surfaces & chrome", "For trucks, buses & heavy vehicles"],
    desc: "A heavy-duty truck and vehicle wash shampoo specially formulated to remove road grime, diesel soot, mud and heavy soiling from trucks, buses and large commercial vehicles.",
    scent: "Clean Fresh",
  },
  {
    id: "window-dae-scaler", name: "Window Dae-Scaler", cat: "industrial",
    sub: "Industrial Window & Glass Scale Remover", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/window-dae-scaler.jpg",
    benefits: ["Removes mineral scale & hard water marks", "Leaves glass streak-free", "For windows, glass facades & panels", "Industrial concentration"],
    desc: "An industrial-strength window and glass descaler formulated to remove stubborn mineral scale, hard water deposits and calcium build-up from glass surfaces — leaving a clear, streak-free finish.",
    scent: null,
  },
  {
    id: "alkaline-washing-powders", name: "Alkaline Washing Powders", cat: "industrial",
    sub: "High-Alkaline Industrial Cleaning Powder", price: 0,
    size: "25kg", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/alkaline-washing-powders.jpg",
    benefits: ["High-alkaline formula cuts grease", "For industrial laundry & surface cleaning", "Removes oils, proteins & heavy soiling", "Suitable for commercial washing machines"],
    desc: "A high-alkaline washing powder designed for industrial laundry and surface cleaning applications — effectively cutting through grease, oils and protein-based soiling in commercial and industrial settings.",
    scent: "Clean Fresh",
  },
  {
    id: "alubrite", name: "Alubrite", cat: "industrial",
    sub: "Aluminium Brightener & Cleaner", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/alubrite.jpg",
    benefits: ["Brightens & cleans aluminium", "Removes oxidation & staining", "For wheels, tanks & aluminium surfaces", "Restores original shine"],
    desc: "A specialist aluminium brightener and cleaner formulated to remove oxidation, staining and dulling from aluminium surfaces — restoring a bright, clean finish on wheels, tanks and aluminium panels.",
    scent: null,
  },
  {
    id: "hf-alubrite", name: "HF Alubrite", cat: "industrial",
    sub: "High-Foam Aluminium Brightener", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/hf-alubrite.jpg",
    benefits: ["High-foam formula for better coverage", "Brightens aluminium fast", "For truck tanks & trailers", "Removes heavy oxidation"],
    desc: "A high-foam aluminium brightener delivering improved surface coverage and faster brightening — specially formulated for truck tanks, trailers and large aluminium surfaces requiring a deep clean and restoration.",
    scent: null,
  },
  {
    id: "anti-freeze-concentrate", name: "Anti-Freeze Concentrate 96%", cat: "industrial",
    sub: "High-Concentration Coolant Anti-Freeze", price: 0,
    size: "25L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/anti-freeze-concentrate.jpg",
    benefits: ["96% concentrate formula", "Protects against freezing & overheating", "Compatible with most cooling systems", "Extends coolant system life"],
    desc: "A high-concentration 96% anti-freeze coolant formulated to protect vehicle and industrial cooling systems against freezing, overheating and corrosion — compatible with most radiator and cooling systems.",
    scent: null,
  },
  {
    id: "hand-cleaner-paste-grit", name: "Hand Cleaner Paste - Grit", cat: "industrial",
    sub: "Heavy-Duty Grit Hand Cleaner for Workshop Use", price: 0,
    size: "5kg", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/hand-cleaner-paste-grit.jpg",
    benefits: ["Removes grease, oil & industrial grime", "Grit particles for deep scrubbing", "Moisturises while it cleans", "For mechanics, engineers & factory workers"],
    desc: "A heavy-duty grit hand cleaner paste formulated for mechanics, engineers and industrial workers — using fine grit particles to deep-clean grease, oil and stubborn industrial grime from hands.",
    scent: "Clean Fresh",
  },
  {
    id: "bio-degreaser-specialised", name: "Bio Degreaser Specialised", cat: "industrial",
    sub: "Biological Enzyme Industrial Degreaser", price: 0,
    size: "5L", rating: 4.8, reviews: 0, badge: null,
    img: "assets/products/bio-degreaser-specialised.jpg",
    benefits: ["Enzyme-powered biological degreasing", "Eco-friendly & biodegradable", "Breaks down oils & hydrocarbons", "Safe for drains & waterways"],
    desc: "A specialised biological enzyme degreaser that uses natural bacteria and enzymes to break down oils, fats and hydrocarbons — an eco-friendly, biodegradable alternative for industrial degreasing applications.",
    scent: null,
  },
  {
    id: "eco-degreaser-hd-red", name: "Eco Degreaser HD Red", cat: "industrial",
    sub: "Eco-Friendly Heavy-Duty Red Degreaser", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/eco-degreaser-hd-red.jpg",
    benefits: ["Heavy-duty eco-friendly formula", "Biodegradable & low-toxicity", "Removes grease & oils effectively", "For industrial & commercial use"],
    desc: "An eco-friendly heavy-duty red degreaser formulated to deliver powerful grease and oil removal while maintaining a low-toxicity, biodegradable profile — suitable for industrial and commercial cleaning applications.",
    scent: null,
  },
  {
    id: "engine-cleaner-waterbased", name: "Engine Cleaner (Waterbased)", cat: "car-exterior",
    sub: "Water-Based Engine Degreasing & Cleaning Solution", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/engine-cleaner-waterbased.jpg",
    benefits: ["Water-based & safe to use", "Removes grease, oil & grime from engines", "Rinses off cleanly with water", "Safe on rubber & plastic components"],
    desc: "A water-based engine cleaner formulated to degrease and clean engine bays and components — effectively removing grease, oil and grime while being safe on rubber seals, plastic and painted surfaces.",
    scent: null,
  },
  {
    id: "tar-remover", name: "Tar Remover", cat: "car-exterior",
    sub: "Fast-Acting Tar, Sap & Road Grime Remover", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/tar-remover.jpg",
    benefits: ["Dissolves tar & bitumen on contact", "Removes tree sap & road grime", "Safe on paintwork & clearcoat", "No abrasive scrubbing needed"],
    desc: "A fast-acting tar and road grime remover that dissolves bitumen deposits, tree sap and stubborn road contamination from vehicle paintwork — leaving surfaces clean without abrasive scrubbing.",
    scent: null,
  },
  {
    id: "auto-spot-cleaner", name: "Auto Spot Cleaner", cat: "car-exterior",
    sub: "Targeted Spot & Stain Remover for Vehicles", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/auto-spot-cleaner.jpg",
    benefits: ["Targets stubborn spots & stains", "Safe on all exterior surfaces", "Quick-acting formula", "Leaves a clean, streak-free finish"],
    desc: "A targeted spot and stain cleaner formulated for vehicle exterior surfaces — quickly removing stubborn marks, stains and localised contamination without damaging paintwork or clearcoat.",
    scent: null,
  },
  {
    id: "bumper-black", name: "Bumper Black", cat: "car-exterior",
    sub: "Deep Black Bumper & Plastic Restorer", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/bumper-black.jpg",
    benefits: ["Restores deep black finish to bumpers", "Revives faded plastic & rubber trim", "Long-lasting black coating", "UV-resistant protection"],
    desc: "A concentrated black restorer formulated to revive faded bumpers, plastic trim and rubber components — delivering a deep, lasting black finish with UV protection against future fading.",
    scent: null,
  },
  {
    id: "chassis-black-water-based", name: "Chassis Black (Water Based)", cat: "car-exterior",
    sub: "Water-Based Black Chassis Protection Coating", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/chassis-black-water-based.jpg",
    benefits: ["Water-based & low odour", "Protects chassis from rust & corrosion", "Durable black coating finish", "Easy water clean-up"],
    desc: "A water-based black chassis protection coating that seals and protects underbody metal surfaces against rust, corrosion and road debris — delivering a durable matt-black finish with low odour and easy clean-up.",
    scent: null,
  },
  {
    id: "concentrated-cleaner-degreaser", name: "Concentrated Cleaner & Degreaser", cat: "car-exterior",
    sub: "Multi-Purpose Concentrated Vehicle Cleaner", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/concentrated-cleaner-degreaser.jpg",
    benefits: ["Highly concentrated — dilutes far", "Removes grease, oil & traffic film", "For engine bays, wheels & exteriors", "Biodegradable formula"],
    desc: "A highly concentrated multi-purpose cleaner and degreaser designed for vehicle surfaces — dilutable for varying cleaning strengths, effective on engine bays, wheels, tyres and all exterior surfaces.",
    scent: null,
  },
  {
    id: "de-wax", name: "De-Wax", cat: "car-exterior",
    sub: "Wax, Silicone & Polish Residue Remover", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/de-wax.jpg",
    benefits: ["Strips wax & silicone residue", "Prepares surface for fresh wax or polish", "Leaves a clean, bare paintwork surface", "Safe on all automotive finishes"],
    desc: "A specialist de-wax solution formulated to strip wax, silicone and polish residue from vehicle paintwork — preparing the surface for a fresh application of wax, sealant or coating.",
    scent: null,
  },
  {
    id: "engine-cleaner-solvent-based", name: "Engine Cleaner (Solvent Based)", cat: "car-exterior",
    sub: "Solvent-Based Heavy-Duty Engine Degreaser", price: 0,
    size: "5L", rating: 4.7, reviews: 0, badge: null,
    img: "assets/products/engine-cleaner-solvent-based.jpg",
    benefits: ["Powerful solvent-based degreasing", "Penetrates heavy grease & oil build-up", "Fast-acting on engine components", "Evaporates cleanly after application"],
    desc: "A heavy-duty solvent-based engine cleaner that penetrates and dissolves stubborn grease, oil and carbon deposits from engine components — fast-acting and effective on even the most heavily soiled engine bays.",
    scent: null,
  },
];

// Products seed — starts from localStorage cache, then live-patches from API
let PRODUCTS = (() => {
  try {
    const raw = localStorage.getItem("ab_products");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const ids = new Set(parsed.map(p => p.id));
        const valid = ids.has('all-purpose-cleaner') && ids.has('hand-surface-sanitiser');
        if (valid) return parsed;
        localStorage.removeItem("ab_products"); // stale cache — clear it
      }
    }
  } catch {}
  return PRODUCTS_DEFAULT;
})();

// Fetch from API and signal a re-render via custom event
(async () => {
  try {
    const res = await fetch("/api/products");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      PRODUCTS = data;
      window.PRODUCTS = data;
      try { localStorage.setItem("ab_products", JSON.stringify(data)); } catch {}
      window.dispatchEvent(new Event("ab:products-loaded"));
    }
  } catch {}
})();

/* Settings (business info + VAT number) — used by invoice + footer */
(async () => {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) return;
    const s = await res.json();
    window.__settings = s;
    window.dispatchEvent(new Event("ab:settings-loaded"));
  } catch {}
})();

/* ── Money formatter — South African Rand: R 1,250.00 ─────────────────────────── */
const money = (n) => {
  const abs  = Math.abs(n || 0).toFixed(2);
  const [int, dec] = abs.split('.');
  return 'R ' + int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + dec;
};

const catOf = (id) => CATEGORIES.find((c) => c.id === id);

/* ── Guest ID (persisted for abandoned cart tracking) ─────────────────────────── */
function getGuestId() {
  try {
    let id = localStorage.getItem('ab_guest_id');
    if (!id) { id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; localStorage.setItem('ab_guest_id', id); }
    return id;
  } catch { return null; }
}

const FREE_SHIP  = 750;
const CUST_BASE  = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'https://maxwell-chi.vercel.app' : '';

/* ── Cart context ─────────────────────────────────────────────────────────────── */
const CartContext = React.createContext(null);
const useCart    = () => React.useContext(CartContext);

function CartProvider({ children }) {
  const [items,   setItems]   = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("ab_cart") || "[]"); } catch { return []; }
  });
  const [open,    setOpen]    = React.useState(false);
  const [toast,   setToast]   = React.useState(null);
  const [coupon,  setCoupon]  = React.useState(() => {
    try { const s = localStorage.getItem("ab_coupon"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const toastTimer = React.useRef(null);
  const syncTimer  = React.useRef(null);

  /* Persist cart locally */
  React.useEffect(() => {
    try { localStorage.setItem("ab_cart", JSON.stringify(items)); } catch {}
  }, [items]);

  /* Persist coupon locally */
  React.useEffect(() => {
    try {
      if (coupon) localStorage.setItem("ab_coupon", JSON.stringify(coupon));
      else localStorage.removeItem("ab_coupon");
    } catch {}
  }, [coupon]);

  /* Reload cart after guest→customer merge */
  React.useEffect(() => {
    const h = () => {
      try {
        const raw = localStorage.getItem("ab_cart");
        if (raw) setItems(JSON.parse(raw));
      } catch {}
    };
    window.addEventListener("ab:cart-merged", h);
    return () => window.removeEventListener("ab:cart-merged", h);
  }, []);

  /* Debounced server sync for abandoned cart tracking */
  React.useEffect(() => {
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      const guestId = getGuestId();
      const session = (() => { try { const s = JSON.parse(localStorage.getItem('ab_customer_session_v2') || 'null'); return s?.expiresAt > Date.now() ? s : null; } catch { return null; } })();
      if (!items.length && !session) return; // don't send empty guest carts
      const headers = { 'Content-Type': 'application/json' };
      if (session?.sessionToken) headers['Authorization'] = `Bearer ${session.sessionToken}`;
      fetch(`${CUST_BASE}/api/carts`, {
        method:  'POST',
        headers,
        body:    JSON.stringify({ guestId, items, email: session?.customer?.email || null }),
      }).catch(() => {});
    }, 3000);
    return () => clearTimeout(syncTimer.current);
  }, [items]);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const add = (product, qty = 1) => {
    const maxStock = typeof product.stock === 'number' ? product.stock : Infinity;
    if (maxStock <= 0) { showToast(`${product.name} is out of stock`); return; }
    setItems((prev) => {
      const found      = prev.find((i) => i.id === product.id);
      const currentQty = found ? found.qty : 0;
      const newQty     = Math.min(currentQty + qty, maxStock);
      if (newQty <= currentQty) { showToast(`Only ${maxStock} unit${maxStock === 1 ? '' : 's'} available`); return prev; }
      if (found) return prev.map((i) => i.id === product.id ? { ...i, qty: newQty } : i);
      return [...prev, { id: product.id, qty: newQty }];
    });
    showToast(`${product.name} added to cart`);
  };

  const setQty = (id, qty) => setItems((prev) => {
    const product  = PRODUCTS.find((p) => p.id === id);
    const maxStock = typeof product?.stock === 'number' ? product.stock : Infinity;
    const clamped  = Math.min(qty, maxStock);
    return clamped <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => i.id === id ? { ...i, qty: clamped } : i);
  });

  const remove = (id) => { setItems((prev) => prev.filter((i) => i.id !== id)); };

  const clear = () => {
    setItems([]);
    setCoupon(null);
    /* Mark cart converted */
    const guestId = getGuestId();
    const session = (() => { try { const s = JSON.parse(localStorage.getItem('ab_customer_session_v2') || 'null'); return s?.expiresAt > Date.now() ? s : null; } catch { return null; } })();
    const headers = { 'Content-Type': 'application/json' };
    if (session?.sessionToken) headers['Authorization'] = `Bearer ${session.sessionToken}`;
    fetch(`${CUST_BASE}/api/carts`, {
      method:  'POST',
      headers,
      body:    JSON.stringify({ guestId, action: 'convert' }),
    }).catch(() => {});
  };

  const detailed = items.map((i) => ({ ...i, product: PRODUCTS.find((p) => p.id === i.id) })).filter((i) => i.product);
  const count    = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = detailed.reduce((s, i) => s + i.product.price * i.qty, 0);

  const value = { items, detailed, count, subtotal, add, setQty, remove, clear, open, setOpen, toast, coupon, setCoupon };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* ── Primitives ───────────────────────────────────────────────────────────────── */
function useInView(threshold = 1.0, safety = 1400) {
  const ref = React.useRef(null);
  const [v, setV] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(true); return; }
    let done = false;
    const arm = () => { if (done) return; done = true; setV(true); teardown(); };
    const check = () => {
      if (done || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh * threshold && r.bottom > -40) arm();
    };
    const timers = [requestAnimationFrame(check), setTimeout(check, 120), setTimeout(check, 450), setTimeout(arm, safety)];
    function teardown() { timers.forEach((t) => { cancelAnimationFrame(t); clearTimeout(t); }); window.removeEventListener("scroll", check); window.removeEventListener("resize", check); }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(check);
    return teardown;
  }, [threshold, safety]);
  return [ref, v];
}

const Reveal = ({ children, className = "", delay = 0, y = 20, as = "div" }) => {
  const [ref, v] = useInView();
  const Tag = as;
  return (
    <Tag ref={ref} className={className} style={{ transition: "transform .7s cubic-bezier(.16,1,.3,1), opacity .7s ease", transitionDelay: `${delay}ms`, transform: v ? "translateY(0)" : `translateY(${y}px)`, opacity: v ? 1 : 0.001 }}>
      {children}
    </Tag>
  );
};

const Stars = ({ value, size = 14, className = "" }) => (
  <span className={`relative inline-flex ${className}`} style={{ lineHeight: 0 }} aria-label={`${value} out of 5`}>
    <span className="flex text-slate-200">{[0,1,2,3,4].map((i) => <Star key={i} size={size} fill="currentColor" strokeWidth={0} />)}</span>
    <span className="absolute inset-0 flex overflow-hidden text-amber-400" style={{ width: `${(value / 5) * 100}%` }}>
      {[0,1,2,3,4].map((i) => <Star key={i} size={size} fill="currentColor" strokeWidth={0} />)}
    </span>
  </span>
);

const CatIcon = ({ name, ...rest }) => {
  const map = { Home: window.Home, Car: window.Car, Shield: window.Shield, Spray: window.Spray };
  const C = map[name] || window.Sparkles;
  return <C {...rest} />;
};

/* ── Product media helpers ─────────────────────────────────────────────────── */

function getPrimaryImg(p) {
  if (p && p.media && p.media.length > 0) {
    const primary = p.media.find(m => m.isPrimary && m.type === 'image');
    if (primary && primary.url) return primary.url;
    const firstImg = p.media.find(m => m.type === 'image');
    if (firstImg && firstImg.url) return firstImg.url;
  }
  return (p && p.img) ? p.img : 'assets/products/placeholder.svg';
}

function getSecondImg(p) {
  if (!p || !p.media || p.media.length < 2) return null;
  const images = p.media.filter(m => m.type === 'image' && m.url);
  if (images.length < 2) return null;
  const secondary = images.find(m => !m.isPrimary);
  return secondary ? secondary.url : null;
}

Object.assign(window, { BRAND, CATEGORIES, PRODUCTS, money, catOf, FREE_SHIP, getGuestId, CartContext, CartProvider, useCart, useInView, Reveal, Stars, CatIcon, getPrimaryImg, getSecondImg });
