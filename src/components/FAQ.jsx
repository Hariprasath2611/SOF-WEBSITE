import React, { useState } from 'react';
import { faqData } from '../data/faq';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openId, setOpenId] = useState(1);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="section faq-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <HelpCircle size={14} />
            <span>Frequently Answered Inquiries</span>
          </div>
          <h2 className="section-title">Everything You Need to Know</h2>
          <p className="section-subtitle">
            Find immediate answers regarding eligibility across engineering departments, team guidelines, venue access, and event participation.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="faq-accordion">
          {faqData.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFAQ(item.id)}
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <div className="faq-toggle-icon">
                    <ChevronDown size={18} />
                  </div>
                </button>

                {isOpen && (
                  <div className="faq-answer-content">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
