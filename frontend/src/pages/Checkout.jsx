import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import * as api from "../services/api";
import { supabase } from "../services/supabase";

export default function Checkout() {
  return (
    <>
{/* Mock Background Content (Visual Context) */}
<header className="bg-surface/90 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/30 flex justify-between items-center w-full px-container-margin py-sm">
<div className="flex items-center gap-sm">
<span className="material-symbols-outlined text-primary">restaurant</span>
<h1 className="text-headline-md font-headline-md font-bold text-primary">Picklerage</h1>
</div>
<button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined">notifications</span>
</button>
</header>
<main className="p-container-margin space-y-lg pb-32">
{/* Mock Page Content */}
<div className="bg-white rounded-lg p-md shadow-sm border border-outline-variant/20">
<h2 className="font-headline-md text-headline-md mb-sm">Menu Categories</h2>
<div className="flex gap-sm overflow-x-auto pb-xs">
<span className="bg-primary text-on-primary px-md py-xs rounded-full font-label-md text-label-md">Thai Classics</span>
<span className="bg-surface-container-low text-on-surface-variant px-md py-xs rounded-full font-label-md text-label-md border border-outline-variant/30">Curries</span>
<span className="bg-surface-container-low text-on-surface-variant px-md py-xs rounded-full font-label-md text-label-md border border-outline-variant/30">Beverages</span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-md">
{/* Demo Buttons to trigger modals */}
<button className="bg-primary-container text-on-primary-container p-md rounded-lg flex items-center justify-between group active:scale-95 transition-all" onclick="toggleSheet('checkout-sheet')">
<div className="text-left">
<p className="font-label-md text-label-md uppercase tracking-wider opacity-80">Action</p>
<p className="font-headline-md text-headline-md">Open Checkout</p>
</div>
<span className="material-symbols-outlined text-3xl group-hover:translate-x-1 transition-transform">shopping_cart_checkout</span>
</button>
<button className="bg-secondary-container text-on-secondary-container p-md rounded-lg flex items-center justify-between group active:scale-95 transition-all" onclick="toggleSheet('waiter-sheet')">
<div className="text-left">
<p className="font-label-md text-label-md uppercase tracking-wider opacity-80">Service</p>
<p className="font-headline-md text-headline-md">Call Waiter</p>
</div>
<span className="material-symbols-outlined text-3xl group-hover:translate-x-1 transition-transform">person_raised_hand</span>
</button>
<button className="bg-surface-container-highest text-on-surface p-md rounded-lg flex items-center justify-between group active:scale-95 transition-all border border-outline-variant/30" onclick="toggleSheet('history-sheet')">
<div className="text-left">
<p className="font-label-md text-label-md uppercase tracking-wider opacity-80">Activity</p>
<p className="font-headline-md text-headline-md">Order History</p>
</div>
<span className="material-symbols-outlined text-3xl group-hover:translate-x-1 transition-transform">history</span>
</button>
<button className="bg-surface-container-highest text-on-surface p-md rounded-lg flex items-center justify-between group active:scale-95 transition-all border border-outline-variant/30" onclick="toggleSheet('category-sheet')">
<div className="text-left">
<p className="font-label-md text-label-md uppercase tracking-wider opacity-80">Explore</p>
<p className="font-headline-md text-headline-md">Full Menu List</p>
</div>
<span className="material-symbols-outlined text-3xl group-hover:translate-x-1 transition-transform">menu_book</span>
</button>
</div>
</main>
{/* Modal Overlays & Bottom Sheets */}
{/* 1. CHECKOUT SLIDE-UP SHEET */}
<div className="fixed inset-0 bg-black/40 z-[60] hidden transition-opacity duration-300 backdrop-blur-sm" id="checkout-sheet-overlay" onclick="toggleSheet('checkout-sheet')"></div>
<div className="fixed bottom-0 left-0 right-0 z-[70] bg-surface rounded-t-lg shadow-xl bottom-sheet-transition sheet-hidden max-h-[795px] flex flex-col" id="checkout-sheet">
<div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto my-md flex-shrink-0"></div>
<div className="px-container-margin pb-xl overflow-y-auto">
<div className="flex justify-between items-end mb-lg">
<div>
<h2 className="font-headline-lg-mobile text-headline-lg-mobile">Checkout</h2>
<p className="text-on-surface-variant font-label-md text-label-md">Review your selections</p>
</div>
<div className="bg-surface-container-high px-md py-1 rounded-full border border-outline-variant/30">
<span className="font-label-md text-label-md text-primary">Dine-in, Table-1</span>
</div>
</div>
{/* Order Summary */}
<div className="space-y-md mb-xl">
<div className="flex items-center gap-md">
<div className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0" data-alt="A premium food photography shot of authentic Pad Thai noodles with shrimp, tofu, and crushed peanuts, plated beautifully on a ceramic dish. The lighting is warm and cinematic, highlighting the vibrant textures and colors against a soft, creamy bistro background with forest green accents." style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDEwz8Z7mDETeZDis7X872JeLb-uPZ9UpV1gYzqwNuNvPdECWhxM3erg5ihhww3RHVXLOgEpRn16oxcylEaTyZRWHZHtS-aH99TbvG2Oyv1Rz2OMRzJbAlCxlOP3tH7DVAJRLfvO0LGWGXQ8G_-T9VTHnz1s4TtecQ04jMnOnm5x5bVlTHHfWSixA04uSmWumqgX2FqVJluEeDfpyuM27pSEvUjVQeOs-e8GFIHhCFssvbCpGBvHmyuJ3fr5t0zd03NP1cYw7w3ZrA")` }}></div>
<div className="flex-grow">
<div className="flex justify-between">
<span className="font-headline-md text-headline-md">Pad Thai</span>
<span className="font-label-md text-label-md">$14.50</span>
</div>
<p className="text-on-surface-variant font-label-sm text-label-sm">Quantity: 1</p>
</div>
</div>
<div className="flex items-center gap-md">
<div className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0" data-alt="A top-down view of a rich, aromatic Green Curry in a traditional bowl, garnished with fresh basil leaves and red chili. The scene is bright and airy with high-key lighting, emphasizing a clean and modern restaurant aesthetic using warm wood tones and vibrant green colors." style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAB3YISW3Pjz8qu-P0RnuZN4h0VDTOCWau7rEKfH0g9trc6sGUq5b26TOySrsc4-SahkxWRgB1BbXzb0kDDu0wpG7wj3ENeInQTeqFd7xX8s4VN134-tWUdmfxlaStjqcye24Owc0Mfiv-b_j1dPNjTJGKqi8mq3wDBZ_4tyjh8usWKJK34E_II-zzWkW0NjVz3BC3iKD6pZ0z-gGZ2_SXMsIkjottOpmSvIUEhifLQomNAOXJ2ofyRGySehlgT5nQvxAU7qy5sjgQ")` }}></div>
<div className="flex-grow">
<div className="flex justify-between">
<span className="font-headline-md text-headline-md">Green Curry</span>
<span className="font-label-md text-label-md">$16.00</span>
</div>
<p className="text-on-surface-variant font-label-sm text-label-sm">Quantity: 1</p>
</div>
</div>
</div>
{/* Totals */}
<div className="border-t border-outline-variant/30 py-md space-y-sm">
<div className="flex justify-between text-on-surface-variant">
<span className="font-body-md text-body-md">Subtotal</span>
<span className="font-body-md text-body-md">$30.50</span>
</div>
<div className="flex justify-between text-on-surface-variant">
<span className="font-body-md text-body-md">Service Fee (5%)</span>
<span className="font-body-md text-body-md">$1.52</span>
</div>
<div className="flex justify-between text-primary font-bold">
<span className="font-headline-md text-headline-md">Total</span>
<span className="font-headline-md text-headline-md">$32.02</span>
</div>
</div>
{/* Form Fields */}
<div className="space-y-md mt-md">
<div>
<label className="block font-label-md text-label-md mb-xs text-on-surface-variant">Full Name</label>
<input className="w-full bg-surface-container-low border-outline-variant/50 rounded-lg p-md focus:ring-primary focus:border-primary" placeholder="Enter your name" type="text" />
</div>
<div>
<label className="block font-label-md text-label-md mb-xs text-on-surface-variant">Mobile Number</label>
<input className="w-full bg-surface-container-low border-outline-variant/50 rounded-lg p-md focus:ring-primary focus:border-primary" placeholder="+1 (555) 000-0000" type="tel" />
</div>
</div>
<button className="w-full bg-primary text-on-primary py-lg rounded-full font-headline-md text-headline-md mt-xl shadow-lg active:scale-[0.98] transition-transform">
                Confirm Order
            </button>
</div>
</div>
{/* 2. WAITER MODAL */}
<div className="fixed inset-0 bg-black/40 z-[60] hidden transition-opacity duration-300 backdrop-blur-sm" id="waiter-sheet-overlay" onclick="toggleSheet('waiter-sheet')"></div>
<div className="fixed bottom-0 left-0 right-0 z-[70] bg-surface rounded-t-lg shadow-xl bottom-sheet-transition sheet-hidden" id="waiter-sheet">
<div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto my-md"></div>
<div className="px-container-margin pb-xl">
<h2 className="font-headline-lg-mobile text-headline-lg-mobile mb-md text-center">How can we help?</h2>
<div className="grid grid-cols-1 gap-md">
<div className="bg-surface-container-low p-md rounded-lg flex items-center justify-between border border-outline-variant/20 hover:border-primary/40 transition-colors cursor-pointer group">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-primary text-2xl">water_drop</span>
<span className="font-headline-md text-headline-md">Water please</span>
</div>
<button className="bg-primary-container text-on-primary-container px-lg py-xs rounded-full font-label-md text-label-md">Select</button>
</div>
<div className="bg-surface-container-low p-md rounded-lg flex items-center justify-between border border-outline-variant/20 hover:border-primary/40 transition-colors cursor-pointer group">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-primary text-2xl">add_shopping_cart</span>
<span className="font-headline-md text-headline-md">New order</span>
</div>
<button className="bg-primary-container text-on-primary-container px-lg py-xs rounded-full font-label-md text-label-md">Select</button>
</div>
<div className="bg-surface-container-low p-md rounded-lg flex items-center justify-between border border-outline-variant/20 hover:border-primary/40 transition-colors cursor-pointer group">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
<span className="font-headline-md text-headline-md">Bill Please</span>
</div>
<button className="bg-primary-container text-on-primary-container px-lg py-xs rounded-full font-label-md text-label-md">Select</button>
</div>
</div>
<button className="w-full mt-xl text-on-surface-variant font-label-md text-label-md uppercase tracking-widest" onclick="toggleSheet('waiter-sheet')">Dismiss</button>
</div>
</div>
{/* 3. ORDER HISTORY MODAL */}
<div className="fixed inset-0 bg-black/40 z-[60] hidden transition-opacity duration-300 backdrop-blur-sm" id="history-sheet-overlay" onclick="toggleSheet('history-sheet')"></div>
<div className="fixed bottom-0 left-0 right-0 z-[70] bg-surface rounded-t-lg shadow-xl bottom-sheet-transition sheet-hidden max-h-[751px] flex flex-col" id="history-sheet">
<div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto my-md flex-shrink-0"></div>
<div className="px-container-margin pb-xl overflow-y-auto">
<h2 className="font-headline-lg-mobile text-headline-lg-mobile mb-lg">Your History</h2>
<div className="space-y-lg">
{/* Order Item 1 */}
<div className="bg-white p-md rounded-lg border border-outline-variant/30 shadow-sm">
<div className="flex justify-between items-start mb-md">
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">ORDER #8821</p>
<h3 className="font-headline-md text-headline-md">Tom Yum Goong</h3>
</div>
<div className="flex items-center gap-xs text-secondary font-bold bg-secondary-container/20 px-sm py-1 rounded-full">
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>skillet</span>
<span className="text-label-sm font-label-sm">Sent to kitchen</span>
</div>
</div>
<div className="flex justify-between items-center text-on-surface-variant text-label-sm font-label-sm">
<span>Today, 12:45 PM</span>
<span className="text-on-surface font-bold">$18.00</span>
</div>
</div>
{/* Order Item 2 */}
<div className="bg-white p-md rounded-lg border border-outline-variant/30 shadow-sm opacity-80">
<div className="flex justify-between items-start mb-md">
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">ORDER #8815</p>
<h3 className="font-headline-md text-headline-md">Thai Iced Tea</h3>
</div>
<div className="flex items-center gap-xs text-primary font-bold bg-primary-container/20 px-sm py-1 rounded-full">
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<span className="text-label-sm font-label-sm">Served</span>
</div>
</div>
<div className="flex justify-between items-center text-on-surface-variant text-label-sm font-label-sm">
<span>Today, 12:30 PM</span>
<span className="text-on-surface font-bold">$4.50</span>
</div>
</div>
</div>
</div>
</div>
{/* 4. CATEGORY MODAL */}
<div className="fixed inset-0 bg-black/40 z-[60] hidden transition-opacity duration-300 backdrop-blur-sm" id="category-sheet-overlay" onclick="toggleSheet('category-sheet')"></div>
<div className="fixed bottom-0 left-0 right-0 z-[70] bg-surface rounded-t-lg shadow-xl bottom-sheet-transition sheet-hidden max-h-[751px] flex flex-col" id="category-sheet">
<div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto my-md flex-shrink-0"></div>
<div className="px-container-margin pb-xl overflow-y-auto">
<div className="flex justify-between items-center mb-lg">
<h2 className="font-headline-lg-mobile text-headline-lg-mobile">Menu Categories</h2>
<button className="p-sm rounded-full bg-surface-container-high" onclick="toggleSheet('category-sheet')">
<span className="material-symbols-outlined">close</span>
</button>
</div>
<nav className="space-y-sm">
<a className="flex items-center justify-between p-md rounded-lg bg-primary-container text-on-primary-container font-headline-md" href="#">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined">star</span>
<span>Chef's Specials</span>
</div>
<span className="bg-on-primary-container/20 px-sm rounded-full text-label-sm">8</span>
</a>
<a className="flex items-center justify-between p-md rounded-lg hover:bg-surface-container-high transition-colors font-headline-md" href="#">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined">local_fire_department</span>
<span>Spicy Favorites</span>
</div>
<span className="bg-surface-container-highest px-sm rounded-full text-label-sm">12</span>
</a>
<a className="flex items-center justify-between p-md rounded-lg hover:bg-surface-container-high transition-colors font-headline-md" href="#">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined">ramen_dining</span>
<span>Noodles &amp; Rice</span>
</div>
<span className="bg-surface-container-highest px-sm rounded-full text-label-sm">15</span>
</a>
<a className="flex items-center justify-between p-md rounded-lg hover:bg-surface-container-high transition-colors font-headline-md" href="#">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined">soup_kitchen</span>
<span>Soups</span>
</div>
<span className="bg-surface-container-highest px-sm rounded-full text-label-sm">6</span>
</a>
<a className="flex items-center justify-between p-md rounded-lg hover:bg-surface-container-high transition-colors font-headline-md" href="#">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined">local_bar</span>
<span>Drinks</span>
</div>
<span className="bg-surface-container-highest px-sm rounded-full text-label-sm">22</span>
</a>
<a className="flex items-center justify-between p-md rounded-lg hover:bg-surface-container-high transition-colors font-headline-md" href="#">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined">icecream</span>
<span>Desserts</span>
</div>
<span className="bg-surface-container-highest px-sm rounded-full text-label-sm">5</span>
</a>
</nav>
</div>
</div>
{/* Standard Navigation (Shared Components Mapping) */}
<nav className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-md flex justify-around items-center px-lg pb-safe pt-sm border-t border-outline-variant/30 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-50">
<button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="menu_book">menu_book</span>
<span className="font-label-sm text-label-sm">Menu</span>
</button>
<button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="search">search</span>
<span className="font-label-sm text-label-sm">Search</span>
</button>
<button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="history">history</span>
<span className="font-label-sm text-label-sm">History</span>
</button>
<button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 active:scale-95 transition-transform duration-150" onclick="toggleSheet('waiter-sheet')">
<span className="material-symbols-outlined" data-icon="person_raised_hand">person_raised_hand</span>
<span className="font-label-sm text-label-sm">Call Waiter</span>
</button>
</nav>
    </>
  );
}