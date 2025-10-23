import React from "react";
import PropTypes from "prop-types";
import "./SectionHeader.css";

/**
 * SectionHeader
 * - التحكم في لون العنوان عبر prop: color
 * - التحكم في لون السطر الفرعي عبر prop: subtitleColor (اختياري)
 */
function SectionHeader({
  id,
  title,
  subtitle,
  as = "h2",
  align = "center",
  dense = false,
  color,         // ⬅️ جديد
  subtitleColor, // ⬅️ اختياري
}) {
  const HeadingTag = as;

  // نمرّر الألوان كمتغيرات CSS لتستفيد منها التنسيقات الداخلية
  const styleVars = {
    ...(color ? { "--sh-title-color": color } : null),
    ...(subtitleColor ? { "--sh-subtitle-color": subtitleColor } : null),
  };

  return (
    <div
      className={`section-header ${dense ? "dense" : ""} align-${align}`}
      data-section-header
      style={styleVars}
    >
      <HeadingTag id={id} className="section-title-about">
        {title}
      </HeadingTag>
      {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
    </div>
  );
}

SectionHeader.propTypes = {
  id: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  as: PropTypes.oneOf(["h2", "h3"]),
  align: PropTypes.oneOf(["center", "start", "end"]),
  dense: PropTypes.bool,
  color: PropTypes.string,        
  subtitleColor: PropTypes.string, 
};

export default SectionHeader;
