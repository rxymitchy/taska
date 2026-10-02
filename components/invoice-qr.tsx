"use client"

import { QRCodeSVG } from "qrcode.react"

export function InvoiceQr({ invoice, size = 180 }: { invoice: string; size?: number }) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-white p-3">
      <QRCodeSVG value={invoice} size={size} level="M" includeMargin={false} title="Lightning invoice QR code" />
    </div>
  )
}
