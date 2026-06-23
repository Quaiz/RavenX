import React, { useState, useEffect, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}|:<>?~';

export default function ScrambleText({ text, trigger = true, duration = 400 }) {
 const [displayText, setDisplayText] = useState(text);
 const frameRef = useRef(null);
 
 useEffect(() => {
 if (trigger) {
 let startTime = null;
 const animate = (timestamp) => {
 if (!startTime) startTime = timestamp;
 const progress = timestamp - startTime;
 const ratio = Math.min(progress / duration, 1);
 
 let newStr = '';
 for (let i = 0; i < text.length; i++) {
 if (text[i] === ' ') {
 newStr += ' ';
 } else if (Math.random() > ratio) {
 newStr += CHARS[Math.floor(Math.random() * CHARS.length)];
 } else {
 newStr += text[i];
 }
 }
 setDisplayText(newStr);
 
 if (ratio < 1) {
 frameRef.current = requestAnimationFrame(animate);
 } else {
 setDisplayText(text);
 }
 };
 
 frameRef.current = requestAnimationFrame(animate);
 } else {
 setDisplayText(text);
 }
 
 return () => {
 if (frameRef.current) cancelAnimationFrame(frameRef.current);
 };
 }, [trigger, text, duration]);
 
 return <span className="font-mono">{displayText}</span>;
}
