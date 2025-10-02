import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Card, Badge } from "./ui";

const DonationCard = ({ donation }) => {
  return (
    <Card className="h-full" shadow="md">
      {/* رأس البطاقة مع نوع الدم + شارة المستعجل */}
      <div
        className="relative h-36 flex items-center justify-center text-white font-bold text-xl bg-cover bg-center"
        style={{
          backgroundImage: `url(${donation.headerImageUrl || "/images/blood-request-fundo.png"})`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <span className="relative z-10">{donation.bloodType || "نوع غير معروف"}</span>

        {/* شارة المستعجل */}
        {donation.isUrgent && (
          <Badge 
            variant="danger" 
            className="absolute top-2 right-2 z-10"
          >
            <i className="fas fa-exclamation-triangle ml-1"></i> مستعجل
          </Badge>
        )}
      </div>

      {/* محتوى البطاقة */}
      <Card.Body className="text-right">
        <p className="font-bold text-text-color mb-3">
          {donation.description || "لا يوجد وصف للحالة."}
        </p>
        
        <div className="space-y-2 text-sm text-text-muted">
          <p className="flex items-center">
            <i className="fas fa-calendar-day text-red-500 ml-2"></i>
            <strong>آخر أجل:</strong>
            <span className="mr-2">
              {donation.deadline ? new Date(donation.deadline).toLocaleDateString() : "غير متوفر"}
            </span>
          </p>
          
          <p className="flex items-center">
            <i className="fas fa-map-marker-alt text-blue-500 ml-2"></i>
            <strong>الموقع:</strong>
            <span className="mr-2">{donation.location || "غير متوفر"}</span>
          </p>
          
          <p className="flex items-center">
            <i className="fas fa-clock text-gray-500 ml-2"></i>
            <strong>تاريخ الإضافة:</strong>
            <span className="mr-2">
              {donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : "غير متوفر"}
            </span>
          </p>
        </div>
      </Card.Body>

      {/* الأزرار */}
      <Card.Footer className="flex justify-between gap-3">
        <Link to={`/blood-donation-details/${donation._id}`} className="flex-1">
          <button className="w-full px-4 py-2 border border-ui-primary text-ui-primary rounded-lg hover:bg-ui-primary hover:text-white transition-colors text-sm font-medium">
            <i className="fas fa-eye ml-1"></i> تفاصيل
          </button>
        </Link>
        <Link to={`/blood-donation-details/${donation._id}`} className="flex-1">
          <button className="w-full px-4 py-2 bg-ui-primary text-white rounded-lg hover:bg-ui-primary-600 transition-colors text-sm font-medium">
            <i className="fas fa-hand-holding-heart ml-1"></i> ساهم بإنقاذ حياة
          </button>
        </Link>
      </Card.Footer>
    </Card>
  );
};

DonationCard.propTypes = {
  donation: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    headerImageUrl: PropTypes.string,
    bloodType: PropTypes.oneOf([
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-",
      "unknown",
    ]),
    isUrgent: PropTypes.bool,
    description: PropTypes.string,
    deadline: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    location: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }).isRequired,
};

export default DonationCard;
