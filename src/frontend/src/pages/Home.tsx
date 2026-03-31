import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Droplets,
  Loader2,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { OrderStatus, ProductSize } from "../backend";
import { useSubmitContactMessage, useSubmitOrder } from "../hooks/useQueries";

const NAV_LINKS = [
  { label: "Bottles", href: "#products" },
  { label: "Samples", href: "#samples" },
  { label: "Customization", href: "#customization" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const SAMPLES = [
  {
    img: "/assets/generated/bottle-500ml-sample1.dim_400x600.png",
    label: "500ml — Sample 1",
    caption: "Blue & Teal Geometric",
    ocid: "samples.item.1",
  },
  {
    img: "/assets/generated/bottle-500ml-sample2.dim_400x600.png",
    label: "500ml — Sample 2",
    caption: "Green & Yellow Nature",
    ocid: "samples.item.2",
  },
  {
    img: "/assets/generated/bottle-1000ml-sample1.dim_400x600.png",
    label: "1000ml — Sample 1",
    caption: "Deep Blue Wave",
    ocid: "samples.item.3",
  },
  {
    img: "/assets/generated/bottle-1000ml-sample2.dim_400x600.png",
    label: "1000ml — Sample 2",
    caption: "Red & Orange Sport",
    ocid: "samples.item.4",
  },
];

const PRODUCTS = [
  {
    name: "500ml Slim Bottle",
    img: "/assets/generated/bottle-500ml.dim_400x600.png",
    desc: "Compact and lightweight, perfect for everyday hydration. Ideal for events, gyms, and corporate gifting.",
    price: "₹9",
    reviews: 142,
    ocid: "products.item.1",
    type: "Slim" as const,
    size: "500ml" as const,
  },
  {
    name: "1000ml Sport Bottle",
    img: "/assets/generated/bottle-1000ml.dim_400x600.png",
    desc: "Large capacity for athletes and outdoor enthusiasts. Maximum branding space for your custom design.",
    price: "₹12",
    reviews: 98,
    ocid: "products.item.2",
    type: "Slim" as const,
    size: "1000ml" as const,
  },
  {
    name: "500ml PET Bottle",
    img: "/assets/generated/pet-bottle-500ml.dim_400x600.png",
    desc: "Crystal-clear PET plastic bottle in 500ml. Lightweight, recyclable, and perfect for custom label branding.",
    price: "₹9",
    reviews: 76,
    ocid: "products.item.3",
    type: "PET" as const,
    size: "500ml" as const,
  },
  {
    name: "1000ml PET Bottle",
    img: "/assets/generated/pet-bottle-1000ml.dim_400x600.png",
    desc: "Large 1000ml PET bottle with premium clarity. Maximum visibility for your brand with full-wrap custom labels.",
    price: "₹12",
    reviews: 54,
    ocid: "products.item.4",
    type: "PET" as const,
    size: "1000ml" as const,
  },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [configuratorSize, setConfiguratorSize] = useState<"500ml" | "1000ml">(
    "500ml",
  );
  const [configuratorType, setConfiguratorType] = useState<"Slim" | "PET">(
    "Slim",
  );
  const [configuratorText, setConfiguratorText] = useState("");
  const [configuratorColor, setConfiguratorColor] = useState("");
  const orderRef = useRef<HTMLDivElement>(null);

  const [orderSize, setOrderSize] = useState<"500ml" | "1000ml">("500ml");
  const [orderQty, setOrderQty] = useState("1");
  const [orderCustomText, setOrderCustomText] = useState("");
  const [orderColor, setOrderColor] = useState("");
  const [orderName, setOrderName] = useState("");
  const [orderPhone, setOrderPhone] = useState("");
  const [orderEmail, setOrderEmail] = useState("");
  const [orderAddress, setOrderAddress] = useState("");
  const [orderLogoFile, setOrderLogoFile] = useState<File | null>(null);
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const submitOrder = useSubmitOrder();
  const submitContact = useSubmitContactMessage();

  const configuratorImage =
    configuratorType === "PET"
      ? configuratorSize === "500ml"
        ? "/assets/generated/pet-bottle-500ml.dim_400x600.png"
        : "/assets/generated/pet-bottle-1000ml.dim_400x600.png"
      : configuratorSize === "500ml"
        ? "/assets/generated/bottle-500ml.dim_400x600.png"
        : "/assets/generated/bottle-1000ml.dim_400x600.png";

  function proceedToOrder(productSize?: "500ml" | "1000ml") {
    if (productSize) setOrderSize(productSize);
    else setOrderSize(configuratorSize);
    setOrderCustomText(configuratorText);
    setOrderColor(configuratorColor);
    orderRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderName || !orderEmail || !orderPhone || !orderAddress) {
      toast.error("Please fill in all required fields.");
      return;
    }
    let logoBlob: ExternalBlob | undefined;
    if (orderLogoFile) {
      try {
        const bytes = new Uint8Array(await orderLogoFile.arrayBuffer());
        logoBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) =>
          setLogoUploadProgress(p),
        );
      } catch {
        toast.error("Failed to process logo file.");
        return;
      }
    }
    try {
      await submitOrder.mutateAsync({
        customerName: orderName,
        email: orderEmail,
        phone: orderPhone,
        deliveryAddress: orderAddress,
        productSize:
          orderSize === "500ml" ? ProductSize._500ml : ProductSize._1000ml,
        quantity: BigInt(Number.parseInt(orderQty) || 1),
        customText: orderCustomText,
        colorPreferences: orderColor,
        logoBlob,
        status: OrderStatus.pending,
        timestamp: BigInt(Date.now()),
      });
      toast.success("Order placed! We'll be in touch within 24 hours.");
      setOrderName("");
      setOrderEmail("");
      setOrderPhone("");
      setOrderAddress("");
      setOrderCustomText("");
      setOrderColor("");
      setOrderQty("1");
      setOrderLogoFile(null);
      setLogoUploadProgress(0);
    } catch {
      toast.error("Failed to submit order. Please try again.");
    }
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      await submitContact.mutateAsync({
        name: contactName,
        email: contactEmail,
        phone: contactPhone || undefined,
        message: contactMessage,
        timestamp: BigInt(Date.now()),
      });
      toast.success("Message sent! We'll get back to you shortly.");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactMessage("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a
              href="/"
              className="flex items-center gap-2 flex-shrink-0"
              data-ocid="nav.link"
            >
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-navy">
                Hydro Logic
              </span>
            </a>
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  data-ocid="nav.link"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              <Button
                className="rounded-pill bg-primary text-primary-foreground hover:opacity-90 font-semibold uppercase tracking-wide text-xs px-5"
                onClick={() => scrollTo("order")}
                data-ocid="nav.primary_button"
              >
                Order Now
              </Button>
            </div>
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-ocid="nav.toggle"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground hover:text-primary px-2"
                  onClick={() => setMobileMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  {link.label}
                </a>
              ))}
              <Button
                className="rounded-pill bg-primary text-primary-foreground font-semibold uppercase tracking-wide text-xs mt-2"
                onClick={() => {
                  scrollTo("order");
                  setMobileMenuOpen(false);
                }}
                data-ocid="nav.primary_button"
              >
                Order Now
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.058 235) 0%, oklch(0.22 0.065 232) 40%, oklch(0.55 0.12 210) 100%)",
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-water-bottles.dim_1600x900.jpg')",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,42,69,0.4) 0%, rgba(11,42,69,0.1) 60%, rgba(11,42,69,0.5) 100%)",
          }}
        />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-teal-light mb-6 px-4 py-1.5 rounded-full border border-teal-light/30 bg-teal-light/10">
              Premium Custom Water Bottles
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Hydrate<span className="block text-teal-light">Your Brand</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Premium customised water bottles for every occasion. Your logo,
              your message, your bottle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="rounded-pill bg-primary hover:opacity-90 text-white font-semibold uppercase tracking-wider px-8 text-sm shadow-lg"
                onClick={() => scrollTo("order")}
                data-ocid="hero.primary_button"
              >
                Order Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-pill border-white/40 text-white hover:bg-white/10 bg-transparent font-semibold uppercase tracking-wider px-8 text-sm"
                onClick={() => scrollTo("products")}
                data-ocid="hero.secondary_button"
              >
                View Products
              </Button>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-white/30 animate-pulse" />
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 block">
              Our Collection
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-navy">
              OUR BOTTLES
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Choose the perfect size and style. All bottles available with full
              custom printing.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRODUCTS.map((product) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group"
                data-ocid={product.ocid}
              >
                <div className="bg-aqua-bg p-8 flex items-center justify-center min-h-64">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="h-56 w-auto object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({product.reviews})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-navy">
                      {product.name}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {product.type}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {product.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {product.price}
                    </span>
                    <Button
                      className="rounded-pill bg-primary text-white hover:opacity-90 font-semibold text-sm uppercase tracking-wide"
                      onClick={() => {
                        setConfiguratorType(product.type);
                        setConfiguratorSize(product.size);
                        scrollTo("customization");
                      }}
                      data-ocid="products.primary_button"
                    >
                      Customise & Order
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SAMPLE GALLERY */}
      <section id="samples" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 block">
              Inspiration Gallery
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-navy">
              CUSTOM LABEL SAMPLES
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              See what's possible. Every label is crafted to tell your brand's
              story — these are just a few examples.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SAMPLES.map((sample, i) => (
              <motion.div
                key={sample.ocid}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group cursor-default"
                data-ocid={sample.ocid}
              >
                <div className="bg-aqua-bg p-6 flex items-center justify-center min-h-64">
                  <img
                    src={sample.img}
                    alt={sample.label}
                    className="h-52 w-auto object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-1">
                    {sample.label}
                  </p>
                  <p className="text-sm font-medium text-navy">
                    {sample.caption}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground text-sm mb-4">
              Love a design? Use our configurator to start your own custom
              order.
            </p>
            <Button
              className="rounded-pill bg-primary text-white font-semibold uppercase tracking-wider hover:opacity-90 px-8"
              onClick={() => scrollTo("customization")}
              data-ocid="samples.primary_button"
            >
              Design Your Bottle
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CUSTOMIZATION */}
      <section id="customization" className="py-24 bg-aqua-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 block">
              Make It Yours
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-navy">
              DESIGN YOUR BOTTLE
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Configure your custom bottle and proceed to order in seconds.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-card-hover p-8 lg:p-12 max-w-4xl mx-auto"
          >
            <div className="grid lg:grid-cols-2 gap-10">
              <div className="flex flex-col items-center justify-center">
                <div className="w-40 h-56 rounded-2xl bg-aqua-bg flex items-center justify-center mb-4">
                  <img
                    src={configuratorImage}
                    alt={`${configuratorSize} ${configuratorType} preview`}
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div className="text-center p-4 bg-aqua-bg rounded-xl w-full">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Live Preview
                  </p>
                  <p className="font-bold text-foreground">
                    {configuratorSize} {configuratorType} Bottle
                  </p>
                  {configuratorText && (
                    <p className="text-sm text-primary mt-1">
                      "{configuratorText}"
                    </p>
                  )}
                  {configuratorColor && (
                    <p className="text-sm text-muted-foreground">
                      Color: {configuratorColor}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div>
                  <Label className="text-sm font-semibold uppercase tracking-wide mb-3 block text-navy">
                    Bottle Type
                  </Label>
                  <div className="flex gap-3">
                    {(["Slim", "PET"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setConfiguratorType(type)}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                          configuratorType === type
                            ? "border-primary bg-primary text-white"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                        data-ocid="customization.toggle"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold uppercase tracking-wide mb-3 block text-navy">
                    Bottle Size
                  </Label>
                  <div className="flex gap-3">
                    {(["500ml", "1000ml"] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setConfiguratorSize(size)}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                          configuratorSize === size
                            ? "border-primary bg-primary text-white"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                        data-ocid="customization.toggle"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="config-text"
                    className="text-sm font-semibold uppercase tracking-wide mb-2 block text-navy"
                  >
                    Custom Label Text
                  </Label>
                  <Input
                    id="config-text"
                    placeholder="e.g. Your Company Name"
                    value={configuratorText}
                    onChange={(e) => setConfiguratorText(e.target.value)}
                    className="rounded-xl"
                    data-ocid="customization.input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="config-color"
                    className="text-sm font-semibold uppercase tracking-wide mb-2 block text-navy"
                  >
                    Color Preferences
                  </Label>
                  <Input
                    id="config-color"
                    placeholder="e.g. Navy blue with gold accents"
                    value={configuratorColor}
                    onChange={(e) => setConfiguratorColor(e.target.value)}
                    className="rounded-xl"
                    data-ocid="customization.input"
                  />
                </div>
                <Button
                  size="lg"
                  className="rounded-pill bg-primary text-white font-semibold uppercase tracking-wider hover:opacity-90 mt-2"
                  onClick={() => proceedToOrder()}
                  data-ocid="customization.primary_button"
                >
                  Proceed to Order
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ORDER FORM */}
      <section id="order" className="py-24 bg-white" ref={orderRef}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 block">
              Ready to Order?
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-navy">
              PLACE YOUR ORDER
            </h2>
            <p className="mt-4 text-muted-foreground">
              Fill in your details and we'll get your custom bottles sorted.
            </p>
          </motion.div>
          <motion.form
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            onSubmit={handleOrderSubmit}
            className="bg-white rounded-2xl shadow-card p-8 border border-border space-y-6"
            data-ocid="order.panel"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block text-navy">
                  Bottle Size *
                </Label>
                <div className="flex gap-3">
                  {(["500ml", "1000ml"] as const).map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setOrderSize(size)}
                      className={`flex-1 py-2.5 px-3 rounded-xl border-2 font-semibold text-sm transition-all ${orderSize === size ? "border-primary bg-primary text-white" : "border-border text-muted-foreground hover:border-primary/50"}`}
                      data-ocid="order.toggle"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label
                  htmlFor="order-qty"
                  className="text-sm font-semibold mb-2 block text-navy"
                >
                  Quantity *
                </Label>
                <Input
                  id="order-qty"
                  type="number"
                  min="1"
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  className="rounded-xl"
                  required
                  data-ocid="order.input"
                />
              </div>
            </div>
            <div>
              <Label
                htmlFor="order-text"
                className="text-sm font-semibold mb-2 block text-navy"
              >
                Custom Label Text
              </Label>
              <Input
                id="order-text"
                placeholder="Text you want on the bottle"
                value={orderCustomText}
                onChange={(e) => setOrderCustomText(e.target.value)}
                className="rounded-xl"
                data-ocid="order.input"
              />
            </div>
            <div>
              <Label
                htmlFor="order-color"
                className="text-sm font-semibold mb-2 block text-navy"
              >
                Color Preferences
              </Label>
              <Input
                id="order-color"
                placeholder="e.g. Blue and white, match our logo colors"
                value={orderColor}
                onChange={(e) => setOrderColor(e.target.value)}
                className="rounded-xl"
                data-ocid="order.input"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2 block text-navy">
                Upload Logo (optional)
              </Label>
              <label
                htmlFor="order-logo-input"
                className="block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                data-ocid="order.dropzone"
              >
                <input
                  id="order-logo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setOrderLogoFile(e.target.files?.[0] ?? null)
                  }
                />
                {orderLogoFile ? (
                  <p className="text-sm text-primary font-medium">
                    {orderLogoFile.name}
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Click to upload your logo
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      PNG, JPG, SVG up to 10MB
                    </p>
                  </>
                )}
              </label>
              {logoUploadProgress > 0 && logoUploadProgress < 100 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${logoUploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploading... {logoUploadProgress}%
                  </p>
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-sm font-bold uppercase tracking-wide mb-4 text-navy">
                Your Details
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="order-name"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="order-name"
                    placeholder="Jane Smith"
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    className="rounded-xl"
                    required
                    data-ocid="order.input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="order-phone"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Phone Number *
                  </Label>
                  <Input
                    id="order-phone"
                    type="tel"
                    placeholder="+1 234 567 8901"
                    value={orderPhone}
                    onChange={(e) => setOrderPhone(e.target.value)}
                    className="rounded-xl"
                    required
                    data-ocid="order.input"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label
                htmlFor="order-email"
                className="text-sm font-medium mb-1.5 block"
              >
                Email Address *
              </Label>
              <Input
                id="order-email"
                type="email"
                placeholder="jane@company.com"
                value={orderEmail}
                onChange={(e) => setOrderEmail(e.target.value)}
                className="rounded-xl"
                required
                data-ocid="order.input"
              />
            </div>
            <div>
              <Label
                htmlFor="order-address"
                className="text-sm font-medium mb-1.5 block"
              >
                Delivery Address *
              </Label>
              <Textarea
                id="order-address"
                placeholder="Street address, City, State, ZIP / Post code, Country"
                value={orderAddress}
                onChange={(e) => setOrderAddress(e.target.value)}
                className="rounded-xl"
                rows={3}
                required
                data-ocid="order.textarea"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-pill bg-primary text-white font-bold uppercase tracking-wider hover:opacity-90"
              disabled={submitOrder.isPending}
              data-ocid="order.submit_button"
            >
              {submitOrder.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
            {submitOrder.isSuccess && (
              <div
                className="text-center p-3 bg-green-50 text-green-700 rounded-xl text-sm"
                data-ocid="order.success_state"
              >
                ✓ Order placed! We'll contact you within 24 hours.
              </div>
            )}
            {submitOrder.isError && (
              <div
                className="text-center p-3 bg-red-50 text-red-700 rounded-xl text-sm"
                data-ocid="order.error_state"
              >
                Something went wrong. Please try again or contact us directly.
              </div>
            )}
          </motion.form>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 bg-aqua-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden h-80 lg:h-96 relative"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.22 0.065 232) 0%, oklch(0.55 0.12 210) 100%)",
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <Droplets className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-2xl font-bold text-center leading-snug">
                  "Pure Quality, Endless Possibilities"
                </p>
                <p className="text-white/70 text-sm mt-2 text-center">
                  Hydro Logic — Customised Water Bottles
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 block">
                About Hydro Logic
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-6 text-navy">
                We Turn Bottles Into
                <span className="block text-primary"> Brand Stories</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Founded with a passion for quality hydration products, Hydro
                Logic specialises in creating premium customised water bottles
                that carry your brand's identity with pride.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Whether you're a corporate team, sports club, event organiser,
                or entrepreneur — we deliver bottles that make a lasting
                impression. Every bottle is crafted with BPA-free materials,
                precision printing, and attention to detail.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                With years of experience and hundreds of happy customers, we're
                your trusted partner for custom hydration solutions.
              </p>
              <div className="flex gap-8 mb-8">
                {[
                  ["500+", "Happy Clients"],
                  ["10K+", "Bottles Delivered"],
                  ["100%", "BPA-Free"],
                ].map(([num, label]) => (
                  <div key={label}>
                    <p className="text-2xl font-extrabold text-primary">
                      {num}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <Button
                className="rounded-pill bg-primary text-white font-semibold uppercase tracking-wider hover:opacity-90"
                onClick={() => scrollTo("contact")}
                data-ocid="about.primary_button"
              >
                Get in Touch
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 block">
              Let's Talk
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-navy">
              GET IN TOUCH
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Have a question or ready to start your custom bottle project? We'd
              love to hear from you.
            </p>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-navy">Contact Details</h3>
              {[
                { icon: Phone, label: "Phone", value: "+1 (555) 012-3456" },
                { icon: Mail, label: "Email", value: "hello@hydro-logic.com" },
                {
                  icon: MapPin,
                  label: "Location",
                  value: "123 Hydration Lane, Water City, WC 10001",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-aqua-bg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {label}
                    </p>
                    <p className="font-medium text-navy">{value}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Business Hours</p>
                <p className="font-medium text-navy">
                  Mon–Fri: 9:00 AM – 6:00 PM
                </p>
                <p className="text-sm text-muted-foreground">
                  Sat: 10:00 AM – 4:00 PM
                </p>
              </div>
            </motion.div>
            <motion.form
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              onSubmit={handleContactSubmit}
              className="space-y-4"
              data-ocid="contact.panel"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="contact-name"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Name *
                  </Label>
                  <Input
                    id="contact-name"
                    placeholder="Your name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="rounded-xl"
                    required
                    data-ocid="contact.input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="contact-email"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Email *
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="your@email.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="rounded-xl"
                    required
                    data-ocid="contact.input"
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor="contact-phone"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Phone (optional)
                </Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="+1 234 567 8901"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="rounded-xl"
                  data-ocid="contact.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="contact-message"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Message *
                </Label>
                <Textarea
                  id="contact-message"
                  placeholder="Tell us about your project or ask us anything..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="rounded-xl"
                  rows={5}
                  required
                  data-ocid="contact.textarea"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-pill bg-primary text-white font-bold uppercase tracking-wider hover:opacity-90"
                disabled={submitContact.isPending}
                data-ocid="contact.submit_button"
              >
                {submitContact.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
              {submitContact.isSuccess && (
                <div
                  className="text-center p-3 bg-green-50 text-green-700 rounded-xl text-sm"
                  data-ocid="contact.success_state"
                >
                  ✓ Message sent! We'll respond within 24 hours.
                </div>
              )}
              {submitContact.isError && (
                <div
                  className="text-center p-3 bg-red-50 text-red-700 rounded-xl text-sm"
                  data-ocid="contact.error_state"
                >
                  Failed to send. Please try again.
                </div>
              )}
            </motion.form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="text-white py-16"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.058 235) 0%, oklch(0.22 0.065 232) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-teal-light" />
                </div>
                <span className="text-xl font-bold">Hydro Logic</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Premium customised water bottles for brands that mean business.
              </p>
            </div>
            <div>
              <h4 className="font-semibold uppercase tracking-wider text-xs mb-4 text-white/40">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-teal-light transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold uppercase tracking-wider text-xs mb-4 text-white/40">
                Products
              </h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm text-white/60">
                    500ml Slim Bottle
                  </span>
                </li>
                <li>
                  <span className="text-sm text-white/60">
                    1000ml Sport Bottle
                  </span>
                </li>
                <li>
                  <span className="text-sm text-white/60">
                    500ml PET Bottle
                  </span>
                </li>
                <li>
                  <span className="text-sm text-white/60">
                    1000ml PET Bottle
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold uppercase tracking-wider text-xs mb-4 text-white/40">
                Contact
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-white/60">
                  <Mail className="w-3.5 h-3.5" />
                  hello@hydro-logic.com
                </li>
                <li className="flex items-center gap-2 text-sm text-white/60">
                  <Phone className="w-3.5 h-3.5" />
                  +1 (555) 012-3456
                </li>
                <li className="flex items-start gap-2 text-sm text-white/60">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  123 Hydration Lane, Water City
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} Hydro Logic. All rights reserved.
            </p>
            <p className="text-sm text-white/40">
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-light hover:text-white transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
