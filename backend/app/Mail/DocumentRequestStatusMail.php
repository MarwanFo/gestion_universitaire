<?php

namespace App\Mail;

use App\Models\DocumentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentRequestStatusMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * The document request instance.
     *
     * @var DocumentRequest
     */
    public $docRequest;

    /**
     * Create a new message instance.
     */
    public function __construct(DocumentRequest $docRequest)
    {
        $this->docRequest = $docRequest;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $statusStr = $this->docRequest->status === 'approved' ? 'Approuvée' : 'Rejetée';
        return new Envelope(
            subject: "UPF - Votre demande de document est {$statusStr}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.document_request_status',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
