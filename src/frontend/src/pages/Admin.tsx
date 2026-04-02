import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Copy,
  Droplets,
  Loader2,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { OrderStatus, ProductSize } from "../backend";
import type { ContactMessage, Order, PriceConfig } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAllContactMessages,
  useGetAllOrders,
  useGetPrices,
  useIsCallerAdmin,
  useUpdateOrderStatus,
  useUpdatePrices,
} from "../hooks/useQueries";

const STATUS_COLORS: Record<string, string> = {
  [OrderStatus.pending]: "bg-amber-100 text-amber-800 border-amber-200",
  [OrderStatus.confirmed]: "bg-blue-100 text-blue-800 border-blue-200",
  [OrderStatus.fulfilled]: "bg-green-100 text-green-800 border-green-200",
};

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSize(size: ProductSize): string {
  return size === ProductSize._500ml ? "500ml" : "1000ml";
}

export default function Admin() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: messages = [], isLoading: messagesLoading } =
    useGetAllContactMessages();
  const updateStatus = useUpdateOrderStatus();
  const { data: priceData } = useGetPrices();
  const updatePrices = useUpdatePrices();
  const [activeTab, setActiveTab] = useState("orders");
  const [price500ml, setPrice500ml] = useState("9");
  const [price1000ml, setPrice1000ml] = useState("12");
  const [discount500ml, setDiscount500ml] = useState("");
  const [discount1000ml, setDiscount1000ml] = useState("");
  const [offerLabel500ml, setOfferLabel500ml] = useState("");
  const [offerLabel1000ml, setOfferLabel1000ml] = useState("");

  useEffect(() => {
    if (priceData) {
      setPrice500ml(priceData.price500ml.toString());
      setPrice1000ml(priceData.price1000ml.toString());
      setDiscount500ml(
        priceData.discount500ml != null
          ? priceData.discount500ml.toString()
          : "",
      );
      setDiscount1000ml(
        priceData.discount1000ml != null
          ? priceData.discount1000ml.toString()
          : "",
      );
      setOfferLabel500ml(priceData.offerLabel500ml ?? "");
      setOfferLabel1000ml(priceData.offerLabel1000ml ?? "");
    }
  }, [priceData]);

  function handleSavePrices() {
    const config: PriceConfig = {
      price500ml: BigInt(price500ml || "9"),
      price1000ml: BigInt(price1000ml || "12"),
      discount500ml: discount500ml ? BigInt(discount500ml) : undefined,
      discount1000ml: discount1000ml ? BigInt(discount1000ml) : undefined,
      offerLabel500ml: offerLabel500ml || undefined,
      offerLabel1000ml: offerLabel1000ml || undefined,
    };
    updatePrices.mutate(config, {
      onSuccess: () => toast.success("Prices updated successfully!"),
      onError: () => toast.error("Failed to update prices. Please try again."),
    });
  }
  const [copied, setCopied] = useState(false);

  const principalId = identity?.getPrincipal().toString() ?? "";

  function copyPrincipal() {
    navigator.clipboard.writeText(principalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isInitializing || (isLoggedIn && adminLoading)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.058 235) 0%, oklch(0.22 0.065 232) 100%)",
        }}
      >
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.058 235) 0%, oklch(0.22 0.065 232) 100%)",
        }}
      >
        <div className="bg-white rounded-2xl shadow-card-hover p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Droplets className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold text-navy">Hydro Logic</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-navy">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in with Internet Identity to access order management.
          </p>
          <Button
            size="lg"
            className="w-full rounded-pill bg-primary text-white font-bold hover:opacity-90"
            onClick={login}
            disabled={loginStatus === "logging-in"}
            data-ocid="admin.primary_button"
          >
            {loginStatus === "logging-in" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          {loginStatus === "loginError" && (
            <p
              className="text-red-500 text-sm mt-3"
              data-ocid="admin.error_state"
            >
              Login failed. Please try again.
            </p>
          )}
          <div className="mt-6">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.058 235) 0%, oklch(0.22 0.065 232) 100%)",
        }}
      >
        <div className="bg-white rounded-2xl shadow-card-hover p-10 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Is account ko admin privileges nahi hain. Apna Principal ID copy
            karein aur developer ko bhejein.
          </p>

          <div className="bg-muted rounded-lg p-3 mb-4 text-left">
            <p className="text-xs text-muted-foreground mb-1 font-medium">
              Aapka Principal ID:
            </p>
            <p className="text-xs font-mono break-all text-foreground">
              {principalId}
            </p>
          </div>

          <Button
            onClick={copyPrincipal}
            variant="outline"
            className="w-full rounded-pill mb-4 gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Principal ID Copy Karein
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground mb-4">
            Upar wala Principal ID copy karke developer ko bhejein. Woh aapko
            admin access de sakta hai.
          </p>

          <Button
            variant="ghost"
            onClick={clear}
            className="rounded-pill text-sm"
          >
            Sign Out
          </Button>
          <div className="mt-4">
            <Link to="/" className="text-sm text-primary hover:underline">
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const typedOrders = orders as Order[];
  const typedMessages = messages as ContactMessage[];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-navy">Hydro Logic</span>
            <span className="text-muted-foreground text-sm">/ Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {identity?.getPrincipal().toString().slice(0, 20)}...
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-pill"
              onClick={clear}
              data-ocid="admin.secondary_button"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </Button>
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-pill"
                data-ocid="admin.link"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Website
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Total Orders",
              value: typedOrders.length,
              color: "text-primary",
            },
            {
              label: "Pending",
              value: typedOrders.filter((o) => o.status === OrderStatus.pending)
                .length,
              color: "text-amber-600",
            },
            {
              label: "Confirmed",
              value: typedOrders.filter(
                (o) => o.status === OrderStatus.confirmed,
              ).length,
              color: "text-blue-600",
            },
            {
              label: "Fulfilled",
              value: typedOrders.filter(
                (o) => o.status === OrderStatus.fulfilled,
              ).length,
              color: "text-green-600",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-border p-5 shadow-xs"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {label}
              </p>
              <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="orders" data-ocid="admin.tab">
              Orders ({typedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="messages" data-ocid="admin.tab">
              Messages ({typedMessages.length})
            </TabsTrigger>
            <TabsTrigger value="prices" data-ocid="admin.tab">
              Price Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {ordersLoading ? (
              <div
                className="flex items-center justify-center py-16"
                data-ocid="admin.loading_state"
              >
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              </div>
            ) : typedOrders.length === 0 ? (
              <div
                className="text-center py-20 text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No orders yet</p>
                <p className="text-sm">
                  Orders will appear here once customers place them.
                </p>
              </div>
            ) : (
              <div
                className="bg-white rounded-xl border border-border overflow-hidden shadow-xs"
                data-ocid="admin.table"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Custom Text</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {typedOrders.map((order, index) => (
                      <TableRow
                        key={`order-${index}-${order.timestamp}`}
                        data-ocid={`admin.item.${index + 1}`}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{index + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {order.customerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {formatSize(order.productSize)}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.quantity.toString()}</TableCell>
                        <TableCell className="max-w-32 truncate text-sm text-muted-foreground">
                          {order.customText || "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(order.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(val) =>
                              updateStatus.mutate({
                                orderId: BigInt(index),
                                status: val as OrderStatus,
                              })
                            }
                          >
                            <SelectTrigger
                              className={`w-32 h-7 text-xs rounded-full border ${STATUS_COLORS[order.status]}`}
                              data-ocid="admin.select"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={OrderStatus.pending}>
                                Pending
                              </SelectItem>
                              <SelectItem value={OrderStatus.confirmed}>
                                Confirmed
                              </SelectItem>
                              <SelectItem value={OrderStatus.fulfilled}>
                                Fulfilled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages">
            {messagesLoading ? (
              <div
                className="flex items-center justify-center py-16"
                data-ocid="admin.loading_state"
              >
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              </div>
            ) : typedMessages.length === 0 ? (
              <div
                className="text-center py-20 text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No messages yet</p>
                <p className="text-sm">
                  Contact form submissions will appear here.
                </p>
              </div>
            ) : (
              <div
                className="bg-white rounded-xl border border-border overflow-hidden shadow-xs"
                data-ocid="admin.table"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {typedMessages.map((msg, index) => (
                      <TableRow
                        key={`msg-${index}-${msg.timestamp}`}
                        data-ocid={`admin.item.${index + 1}`}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {msg.name}
                        </TableCell>
                        <TableCell className="text-sm">{msg.email}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {msg.phone ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-xs text-sm text-muted-foreground">
                          <p className="truncate max-w-56">{msg.message}</p>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(msg.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prices">
            <div className="bg-white rounded-xl border border-border shadow-xs p-8 max-w-2xl">
              <h2 className="text-xl font-bold text-navy mb-1">
                Price Management
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Update bottle prices and discount offers. Changes reflect
                immediately on the website.
              </p>

              <div className="space-y-8">
                <div>
                  <h3 className="text-base font-semibold text-navy mb-4 pb-2 border-b border-border">
                    500ml Bottles
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="price500ml"
                        className="text-sm font-medium"
                      >
                        Price (₹) *
                      </Label>
                      <Input
                        id="price500ml"
                        type="number"
                        min="1"
                        value={price500ml}
                        onChange={(e) => setPrice500ml(e.target.value)}
                        className="rounded-lg"
                        data-ocid="admin.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="discount500ml"
                        className="text-sm font-medium"
                      >
                        Discount Price (₹)
                      </Label>
                      <Input
                        id="discount500ml"
                        type="number"
                        min="1"
                        placeholder="Leave blank for no discount"
                        value={discount500ml}
                        onChange={(e) => setDiscount500ml(e.target.value)}
                        className="rounded-lg"
                        data-ocid="admin.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="offerLabel500ml"
                        className="text-sm font-medium"
                      >
                        Offer Label
                      </Label>
                      <Input
                        id="offerLabel500ml"
                        type="text"
                        placeholder="e.g. Limited Offer!"
                        value={offerLabel500ml}
                        onChange={(e) => setOfferLabel500ml(e.target.value)}
                        className="rounded-lg"
                        data-ocid="admin.input"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-navy mb-4 pb-2 border-b border-border">
                    1000ml Bottles
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="price1000ml"
                        className="text-sm font-medium"
                      >
                        Price (₹) *
                      </Label>
                      <Input
                        id="price1000ml"
                        type="number"
                        min="1"
                        value={price1000ml}
                        onChange={(e) => setPrice1000ml(e.target.value)}
                        className="rounded-lg"
                        data-ocid="admin.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="discount1000ml"
                        className="text-sm font-medium"
                      >
                        Discount Price (₹)
                      </Label>
                      <Input
                        id="discount1000ml"
                        type="number"
                        min="1"
                        placeholder="Leave blank for no discount"
                        value={discount1000ml}
                        onChange={(e) => setDiscount1000ml(e.target.value)}
                        className="rounded-lg"
                        data-ocid="admin.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="offerLabel1000ml"
                        className="text-sm font-medium"
                      >
                        Offer Label
                      </Label>
                      <Input
                        id="offerLabel1000ml"
                        type="text"
                        placeholder="e.g. Buy 2 Get 1"
                        value={offerLabel1000ml}
                        onChange={(e) => setOfferLabel1000ml(e.target.value)}
                        className="rounded-lg"
                        data-ocid="admin.input"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSavePrices}
                  disabled={updatePrices.isPending}
                  className="rounded-pill bg-primary text-white font-bold hover:opacity-90 px-8"
                  data-ocid="admin.save_button"
                >
                  {updatePrices.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : (
                    "Save Prices"
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
