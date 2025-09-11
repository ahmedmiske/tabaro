// src/hooks/useTicker.js
import { useEffect, useState } from 'react';

/**
 * يعيد timestamp متجدّد كل ms ميلي ثانية (افتراضي 1000ms)
 * مفيد للعدادات الحية (الوقت المتبقي..)
 */
export default function useTicker(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
