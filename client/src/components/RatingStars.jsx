// src/components/RatingStars.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function RatingStars({ value=0, onChange, disabled=false }) {
  const [hover, setHover] = React.useState(0);
  const score = hover || value;
  return (
    <div role="radiogroup" aria-label="التقييم" dir="ltr" style={{display:'inline-flex', gap:6}}>
      {[1,2,3,4,5].map(n=>(
        <button
          key={n}
          role="radio"
          aria-checked={score===n}
          onMouseEnter={()=>!disabled && setHover(n)}
          onMouseLeave={()=>!disabled && setHover(0)}
          onClick={()=>!disabled && onChange?.(n)}
          onKeyDown={(e)=>{
            if(disabled) return;
            if(e.key==='ArrowRight'||e.key==='ArrowUp') onChange?.(Math.min(5,(value||0)+1));
            if(e.key==='ArrowLeft'||e.key==='ArrowDown') onChange?.(Math.max(1,(value||0)-1));
          }}
          style={{border:'none',background:'transparent',cursor:disabled?'default':'pointer',fontSize:22,color:(score>=n)?'#FFC107':'#E0E0E0',lineHeight:1}}
          title={`${n} / 5`} aria-label={`${n} من 5`} disabled={disabled}
        >★</button>
      ))}
    </div>
  );
}
RatingStars.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};
