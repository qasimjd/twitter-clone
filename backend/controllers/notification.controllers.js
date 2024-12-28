import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const user = req.user._id;

        const notifications = await Notification.find({ to:user }).sort({ createdAt: -1 }).papulate({
            path: 'from',
            select: 'username profilePicture'
        });

        await Notification.updateMany({ to: user, read: false }, { read: true });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error('erro in notification controller',error);
    }
}; 

export const deleteNotifications = async (req, res) => {
    try {
        const user = req.user._id;
        await Notification.deleteMany({to: user});
        res.status(200).json({ message: 'Notifications deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error('erro in notification controller',error);
        
    }
};