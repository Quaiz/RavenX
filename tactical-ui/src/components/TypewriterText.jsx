import React, { useState, useEffect } from 'react';

const TypewriterText = ({ text, delay = 15, cursor = true, className = "", skip = false }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
  // Reset if text changes
  setDisplayText('');
  setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
  if (skip) {
      setDisplayText(text);
      setCurrentIndex(text.length);
      return;
  }
  if (currentIndex < text.length) {
  const timer = setTimeout(() => {
  setDisplayText(prev => prev + text[currentIndex]);
  setCurrentIndex(prev => prev + 1);
  }, delay);
  return () => clearTimeout(timer);
  }
  }, [currentIndex, text, delay, skip]);

  const isTyping = currentIndex < text.length;

  return (
  <div className={`font-mono ${className}`}>
  {displayText}
  {(isTyping && cursor) && (
  <span className="animate-pulse ml-0.5 inline-block w-1.5 h-3 bg-primary align-middle"/>
  )}
  </div>
  );
};

export default TypewriterText;
