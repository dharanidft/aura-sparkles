"use client";

import React, { useState } from "react";
import { Star, MessageSquarePlus, CheckCircle, ShieldCheck } from "lucide-react";

interface Review {
  id: string;
  author: string;
  location: string;
  fragrance: string;
  rating: number;
  comment: string;
  date: string;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    author: "Ananya S.",
    location: "Bengaluru, Karnataka",
    fragrance: "Mysore Sandalwood Candle",
    rating: 5,
    comment: "The frosted glass jar looks so exquisite on my bedside console. The sandalwood throw is warm and meditative without being overpowering. Will definitely reorder for Diwali gifting!",
    date: "Verified Buyer"
  },
  {
    id: "rev-2",
    author: "Rhea M.",
    location: "Mumbai, Maharashtra",
    fragrance: "Royal Mogra & Jasmine",
    rating: 5,
    comment: "Takes me right back to festive evenings. The jasmine aroma is authentic, sweet, and fills the entire living room within twenty minutes of lighting.",
    date: "Verified Buyer"
  },
  {
    id: "rev-3",
    author: "Kavita D.",
    location: "New Delhi",
    fragrance: "Velvet Vanilla Bean Candle",
    rating: 5,
    comment: "Delightful warm vanilla with zero synthetic after-smell. The packaging was immaculate with bubble wrap and a lovely ribbon. Super impressed with the ₹199 introductory pricing.",
    date: "Verified Buyer"
  }
];

export function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState("");
  const [fragrance, setFragrance] = useState("Mysore Sandalwood Candle");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: author.trim(),
      location: location.trim() || "India",
      fragrance,
      rating,
      comment: comment.trim(),
      date: "Pending Verification"
    };

    setReviews([newRev, ...reviews]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsFormOpen(false);
      setAuthor("");
      setLocation("");
      setComment("");
    }, 2000);
  };

  return (
    <section className="py-20 bg-white border-b border-[#EAE0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center space-x-1.5 text-xs uppercase tracking-luxury text-[#B69A62] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Customer Experiences</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#452638] font-normal tracking-tight">
              Words From Our Community
            </h2>
            <p className="text-sm text-[#766E65] max-w-lg mt-2">
              Real reflections and reviews from homes illuminated by AURA SPARKLES.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border border-[#452638] text-[#452638] hover:bg-[#452638] hover:text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Review Form Drawer/Collapse */}
        {isFormOpen && (
          <div className="mb-12 p-6 md:p-8 bg-white rounded-2xl border border-[#E8C9C5] shadow-card max-w-2xl mx-auto animate-fadeIn">
            {submitted ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-xl text-[#452638]">Thank you for your feedback!</h3>
                <p className="text-xs text-[#766E65]">Your review has been submitted for verification.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-xl text-[#452638] border-b border-[#EAE0D5] pb-2">
                  Share Your Scent Experience
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3 py-2 border border-[#EAE0D5] rounded-lg text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">City, State</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Pune, Maharashtra"
                      className="w-full px-3 py-2 border border-[#EAE0D5] rounded-lg text-xs focus:outline-none focus:border-[#452638]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">Fragrance *</label>
                    <select
                      value={fragrance}
                      onChange={(e) => setFragrance(e.target.value)}
                      className="w-full px-3 py-2 border border-[#EAE0D5] rounded-lg text-xs focus:outline-none focus:border-[#452638] bg-white"
                    >
                      <option>Mysore Sandalwood Candle</option>
                      <option>Velvet Vanilla Bean Candle</option>
                      <option>Blushing Damask Rose Candle</option>
                      <option>Royal Mogra & Jasmine Candle</option>
                      <option>Azure Ocean Breeze Candle</option>
                      <option>The Celebration Candle Trio Gift Box</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#452638] mb-1">Rating</label>
                    <div className="flex items-center space-x-1 py-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= rating
                                ? "text-[#B69A62] fill-[#B69A62]"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#452638] mb-1">Your Review *</label>
                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the scent throw, burn quality, and ambiance..."
                    className="w-full px-3 py-2 border border-[#EAE0D5] rounded-lg text-xs focus:outline-none focus:border-[#452638]"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs text-[#766E65] hover:text-[#452638]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#452638] hover:bg-[#5D354D] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-[#EAE0D5] hover:border-[#E8C9C5] shadow-subtle flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-[#B69A62] fill-[#B69A62]" />
                    ))}
                  </div>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    {rev.date}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#B69A62] uppercase tracking-wide">
                  {rev.fragrance}
                </p>

                <p className="text-xs text-[#766E65] leading-relaxed italic">
                  “{rev.comment}”
                </p>
              </div>

              <div className="pt-3 border-t border-[#EAE0D5]/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-serif font-medium text-[#452638] text-sm">{rev.author}</p>
                  <p className="text-[11px] text-[#766E65]">{rev.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
