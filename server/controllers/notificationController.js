const Notification = require('../models/Notification');

exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ date: -1 });
        res.json({ notifications });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json({ message: 'Notification marked as read', notification });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};