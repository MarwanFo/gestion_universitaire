<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()->get()->map(function ($notif) {
            return [
                'id' => $notif->id,
                'title' => $notif->data['title'] ?? 'Notification',
                'message' => $notif->data['message'] ?? '',
                'type' => $notif->data['type'] ?? 'info',
                'link' => $notif->data['link'] ?? null,
                'read_at' => $notif->read_at,
                'created_at' => $notif->created_at->toIso8601String(),
            ];
        });

        return response()->json($notifications);
    }

    /**
     * Mark a specific notification as read.
     */
    public function read(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marquée comme lue.'
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function readAll(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Toutes les notifications ont été marquées comme lues.'
        ]);
    }
}
