import React from "react";
import { FaUser, FaUserShield, FaHistory } from "react-icons/fa";

import "./HistoryActions.css";

/**
 * props:
 * - actions = [ { action, user, role, fromStatus, toStatus, reason, createdAt } ]
 * - usersMap = { userId: { firstName, lastName, profileImage } } (اختياري)
 */

export default function HistoryActions({ actions = [], usersMap = {} }) {
  if (!actions.length) {
    return (
      <div className="hist-box empty">
        <FaHistory size={20} />
        <span>لا توجد عمليات مسجلة لهذا الطلب</span>
      </div>
    );
  }

  return (
    <div className="hist-box">
      <h5 className="hist-title">
        <FaHistory className="hist-icon" /> سجل العمليات
      </h5>

      <div className="hist-list">
        {actions
          .slice()
          .reverse()
          .map((item, i) => {
            const userInfo = usersMap[item.user] || null;

            const actor =
              item.role === "admin" ? (
                <span className="actor admin">
                  <FaUserShield /> مشرف
                </span>
              ) : (
                <span className="actor user">
                  <FaUser /> المستخدم
                </span>
              );

            return (
              <div key={i} className="hist-item">
                <div className="hist-header">
                  <strong>{mapAction(item.action)}</strong>
                  <span className="hist-date">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                <div className="hist-details">
                  <div>
                    {actor}
                    {userInfo && (
                      <span className="actor-name">
                        {userInfo.firstName} {userInfo.lastName}
                      </span>
                    )}
                  </div>

                  {item.fromStatus && item.toStatus && (
                    <div className="hist-status">
                      {mapStatus(item.fromStatus)} →{" "}
                      {mapStatus(item.toStatus)}
                    </div>
                  )}

                  {item.reason && (
                    <div className="hist-reason">
                      <strong>السبب:</strong> {item.reason}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

/* =========================
   🔄 مابات مساعدة
   ========================= */

function mapStatus(st) {
  const dict = {
    active: "نشط",
    paused: "متوقف",
    cancelled: "ملغى",
    finished: "منتهي الصلاحية",
  };
  return dict[st] || st;
}

function mapAction(action) {
  const dict = {
    create: "إنشاء الطلب",
    user_stop: "إيقاف من المستخدم",
    user_reactivate: "إعادة تفعيل من المستخدم",
    admin_toggle: "تغيير الحالة من المشرف",
    admin_delete: "إلغاء من المشرف",
  };
  return dict[action] || action;
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
