import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type OrderId = bigint;
export interface ContactMessage {
    name: string;
    email: string;
    message: string;
    timestamp: bigint;
    phone?: string;
}
export type ContactId = bigint;
export interface Order {
    customerName: string;
    status: OrderStatus;
    deliveryAddress: string;
    productSize: ProductSize;
    logoBlob?: ExternalBlob;
    email: string;
    colorPreferences: string;
    timestamp: bigint;
    customText: string;
    quantity: bigint;
    phone: string;
}
export interface PriceConfig {
    price500ml: bigint;
    price1000ml: bigint;
    discount500ml?: bigint;
    discount1000ml?: bigint;
    offerLabel500ml?: string;
    offerLabel1000ml?: string;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export enum OrderStatus {
    pending = "pending",
    fulfilled = "fulfilled",
    confirmed = "confirmed"
}
export enum ProductSize {
    _500ml = "_500ml",
    _1000ml = "_1000ml"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllContactMessages(): Promise<Array<ContactMessage>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrderById(orderId: OrderId): Promise<Order>;
    getPrices(): Promise<PriceConfig>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitContactMessage(message: ContactMessage): Promise<ContactId>;
    submitOrder(order: Order): Promise<OrderId>;
    updateOrderStatus(orderId: OrderId, status: OrderStatus): Promise<void>;
    updatePrices(config: PriceConfig): Promise<void>;
}
