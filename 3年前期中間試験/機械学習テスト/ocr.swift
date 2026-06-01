import Foundation
import PDFKit
import Vision
import Cocoa

let pdfURL = URL(fileURLWithPath: "機械学習-中間.pdf")
guard let document = PDFDocument(url: pdfURL) else {
    print("Error: Could not load PDF file.")
    exit(1)
}

let pageCount = document.pageCount
print("Total pages: \(pageCount)")

var extractedText = ""

for i in 0..<pageCount {
    autoreleasepool {
        print("Processing page \(i+1)/\(pageCount)...")
        guard let page = document.page(at: i) else {
            print("Failed to get page \(i+1)")
            return
        }
        
        let bounds = page.bounds(for: .mediaBox)
        let scale: CGFloat = 2.0 // Render at 2x scale for higher OCR accuracy
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
        ) else {
            print("Failed to create CGContext")
            return
        }
        
        // White background
        context.setFillColor(CGColor.white)
        context.fill(CGRect(x: 0, y: 0, width: width, height: height))
        
        context.scaleBy(x: scale, y: scale)
        context.translateBy(x: -bounds.origin.x, y: -bounds.origin.y)
        
        let nsContext = NSGraphicsContext(cgContext: context, flipped: false)
        NSGraphicsContext.current = nsContext
        
        page.draw(with: .mediaBox, to: nsContext.cgContext)
        
        guard let cgImage = context.makeImage() else {
            print("Failed to make CGImage")
            return
        }
        
        let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        
        let request = VNRecognizeTextRequest { (request, error) in
            if let error = error {
                print("OCR Error: \(error)")
                return
            }
            
            guard let observations = request.results as? [VNRecognizedTextObservation] else {
                return
            }
            
            var pageText = "--- PAGE \(i+1) ---\n"
            for observation in observations {
                guard let candidate = observation.topCandidates(1).first else { continue }
                pageText += candidate.string + "\n"
            }
            extractedText += pageText + "\n"
        }
        
        request.recognitionLanguages = ["ja-JP", "en-US"]
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true
        
        do {
            try requestHandler.perform([request])
        } catch {
            print("Failed to perform Vision OCR: \(error)")
        }
    }
}

do {
    try extractedText.write(to: URL(fileURLWithPath: "extracted_text.txt"), atomically: true, encoding: .utf8)
    print("Success! Extracted text saved to extracted_text.txt")
} catch {
    print("Failed to write to file: \(error)")
}
