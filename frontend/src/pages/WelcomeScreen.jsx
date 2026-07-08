import React, { useState } from 'react';

export default function WelcomeScreen({ onSubmit }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState('');

  const isFormValid = name.trim() !== '' && phone.trim().length === 10 && guests > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit({ customer_name: name.trim(), mobile: phone.trim(), guest_count: parseInt(guests, 10) });
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center animate-fade-in p-container-margin">
      {/* Full-screen Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('/welcome_hero.png')" }} 
      />
      <div className="absolute inset-0 z-0 bg-black/60" />
      
      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full md:w-1/2 md:max-w-md flex flex-col gap-xl">
        <div className="flex flex-col items-center text-center">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile mb-xs font-bold tracking-tight text-white drop-shadow-lg">
            Welcome!
          </h1>
          <p className="font-body-md text-body-md text-white/90 max-w-xs drop-shadow-md">
            Please enter your details below to start your ordering session.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-[32px] p-xl flex flex-col gap-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-white/90 ml-1">Your Name</label>
              <input 
                type="text" 
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black/20 text-white placeholder:text-white/50 p-md rounded-xl border border-white/20 focus:border-white focus:ring-1 focus:ring-white focus:outline-none transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-white/90 ml-1">Phone Number</label>
              <input 
                type="tel" 
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className={`bg-black/20 text-white placeholder:text-white/50 p-md rounded-xl border focus:outline-none transition-all ${phone.length > 0 && phone.length !== 10 ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400' : 'border-white/20 focus:border-white focus:ring-1 focus:ring-white'}`}
                maxLength={15}
                required
              />
              {phone.length > 0 && phone.length < 10 && (
                <span className="text-red-300 text-xs mt-1 ml-1 font-medium">Mobile number is less than 10 digits. Please enter a valid 10-digit number.</span>
              )}
              {phone.length > 10 && (
                <span className="text-red-300 text-xs mt-1 ml-1 font-medium">Mobile number is more than 10 digits. Please enter exactly 10 digits.</span>
              )}
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-white/90 ml-1">No. of People</label>
              <input 
                type="number" 
                placeholder="e.g. 2"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="bg-black/20 text-white placeholder:text-white/50 p-md rounded-xl border border-white/20 focus:border-white focus:ring-1 focus:ring-white focus:outline-none transition-all"
                min="1"
                max="20"
                required
              />
            </div>
          </form>

          <button 
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`w-full py-md rounded-full font-label-lg text-label-lg transition-all ${
              isFormValid 
                ? "bg-primary text-on-primary hover:bg-primary/90 active:scale-95 shadow-lg" 
                : "bg-white/10 text-white/40 cursor-not-allowed border border-white/10"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
