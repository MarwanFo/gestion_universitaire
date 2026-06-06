<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class UploadHelper
{
    /**
     * Upload a file to Cloudinary or fallback to local disk.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @param string $disk
     * @return string The absolute Cloudinary URL or local relative path (prefixed with /storage/ for avatars if local)
     */
    public static function upload(UploadedFile $file, string $folder, string $disk = 'public'): string
    {
        try {
            if (config('cloudinary.cloud_url') || env('CLOUDINARY_URL') || (env('CLOUDINARY_API_KEY') && env('CLOUDINARY_API_SECRET'))) {
                return Cloudinary::upload($file->getRealPath(), [
                    'folder' => $folder
                ])->getSecurePath();
            }
        } catch (\Exception $e) {
            report($e);
        }

        // Fallback to local storage
        $path = $file->store($folder, $disk);
        
        // For avatars specifically, the database expects a /storage/ prefix if stored locally
        if ($folder === 'avatars') {
            return '/storage/' . $path;
        }
        
        return $path;
    }
}
