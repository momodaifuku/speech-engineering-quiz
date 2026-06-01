import Foundation
import PDFKit
import Cocoa

let pdfURL = URL(fileURLWithPath: "機械学習-中間.pdf")
guard let document = PDFDocument(url: pdfURL) else {
    print("Error: Could not load PDF file.")
    exit(1)
}

let pageCount = document.pageCount
let outputDir = URL(fileURLWithPath: "rendered_pages")

try? FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true, attributes: nil)

for i in 0..<pageCount {
    autoreleasepool {
        guard let page = document.page(at: i) else { return }
        let bounds = page.bounds(for: .mediaBox)
        let scale: CGFloat = 2.0 // Render at high quality
        let width = Int(bounds.width * scale)
        let height = Int(bounds.height * scale)
        
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        guard let context = CGContext(
            data: nil,
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: 0,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else { return }
        
        context.setFillColor(CGColor.white)
        context.fill(CGRect(x: 0, y: 0, width: width, height: height))
        
        context.scaleBy(x: scale, y: scale)
        context.translateBy(x: -bounds.origin.x, y: -bounds.origin.y)
        
        let nsContext = NSGraphicsContext(cgContext: context, flipped: false)
        NSGraphicsContext.current = nsContext
        
        page.draw(with: .mediaBox, to: nsContext.cgContext)
        
        guard let cgImage = context.makeImage() else { return }
        let nsImage = NSImage(cgImage: cgImage, size: NSSize(width: width, height: height))
        
        guard let tiffData = nsImage.tiffRepresentation,
              let bitmapRep = NSBitmapImageRep(data: tiffData),
              let pngData = bitmapRep.representation(using: .png, properties: [:]) else { return }
        
        let fileURL = outputDir.appendingPathComponent("page_\(i+1).png")
        try? pngData.write(to: fileURL)
        print("Saved page \(i+1) to \(fileURL.path)")
    }
}
