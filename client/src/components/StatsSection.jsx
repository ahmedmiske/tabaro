import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./StatsSection.css";
StatCard.propTypes = {
	icon: PropTypes.node.isRequired,
	value: PropTypes.number.isRequired,
	label: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	color: PropTypes.string.isRequired,
	bg: PropTypes.string.isRequired,
	startCount: PropTypes.bool.isRequired,
};

const stats = [
	{
		icon: "❤️",
		value: 1240,
		label: "تبرع ناجح",
		description: "ساهمنا في إنقاذ الأرواح",
		color: "#ff1744",
		bg: "#fff0f3"
	},
	{
		icon: "🚀",
		value: 85,
		label: "حملة فعالة",
		description: "لجمع التبرعات والمبادرات",
		color: "#2979ff",
		bg: "#f0f7ff"
	},
	{
		icon: "✓",
		value: 530,
		label: "متبرع موثّق",
		description: "في مجتمعنا المتنامي",
		color: "#00c853",
		bg: "#f0fff4"
	},
];

function StatCard({ icon, value, label, description, color, bg, startCount }) {
	const valueRef = useRef();
	useEffect(() => {
		if (!startCount) return;
		let current = 0;
		const steps = 60;
		const increment = value / steps;
		const duration = 1200;
		const timer = setInterval(() => {
			current += increment;
			if (current >= value) {
				current = value;
				clearInterval(timer);
			}
			if (valueRef.current) {
				valueRef.current.textContent = Math.floor(current).toLocaleString("ar");
			}
		}, duration / steps);
		return () => clearInterval(timer);
	}, [value, startCount]);

	return (
		<div className="stat-modern-card" style={{ background: bg, borderColor: color }}>
			<div className="stat-modern-icon" style={{ color, boxShadow: `0 2px 12px ${color}33` }}>{icon}</div>
			<div className="stat-modern-value" ref={valueRef} style={{ color }}>{value}</div>
			<div className="stat-modern-label" style={{ color }}>{label}</div>
			<div className="stat-modern-desc">{description}</div>
		</div>
	);
}

function StatsSection() {
	const [startCount, setStartCount] = React.useState(false);
	const sectionRef = useRef();
	useEffect(() => {
		const section = sectionRef.current;
		if (!section) return;
		const observer = new window.IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setStartCount(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.3 }
		);
		observer.observe(section);
		return () => observer.disconnect();
	}, []);
	return (
		<section className="stats-modern-section" aria-label="إنجازاتنا" ref={sectionRef}>
			<h2 className="stats-modern-title">إنجازاتنا</h2>
			<div className="stats-modern-grid">
				{stats.map((stat, idx) => (
					<StatCard key={idx} {...stat} startCount={startCount} />
				))}
			</div>
		</section>
	);
}

export default StatsSection;
 