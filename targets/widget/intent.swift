import AppIntents
import SwiftUI
import UIKit
import UniformTypeIdentifiers

// "Get This Week's Grid" — exposed to the Shortcuts app so a weekly automation
// can do: Get This Week's Grid → Set Wallpaper. Because the image is rendered
// HERE, at the moment the automation fires, the wallpaper is always current —
// the user never has to open the app.

struct GetWallpaperIntent: AppIntent {
  static var title: LocalizedStringResource = "Get This Week's Grid"
  static var description = IntentDescription(
    "Your life grid, rendered fresh for your screen. Use it in a weekly automation with Set Wallpaper."
  )
  static var openAppWhenRun: Bool = false

  func perform() async throws -> some IntentResult & ReturnsValue<IntentFile> {
    let image = InkWallpaperRenderer.render()
    guard let data = image.pngData() else {
      throw IntentError.renderFailed
    }
    let file = IntentFile(data: data, filename: "ink-week-grid.png", type: .png)
    return .result(value: file)
  }
}

enum IntentError: Swift.Error, CustomLocalizedStringResourceConvertible {
  case renderFailed
  var localizedStringResource: LocalizedStringResource { "Couldn't render the grid." }
}

// MARK: - Renderer (mirrors src/components/WallpaperGrid.tsx exactly)

enum InkWallpaperRenderer {
  // segmentation, same as the app: 13-week quarters across, decades down
  static let quarter = 13
  static let decade = 10
  static let gapR: CGFloat = 0.28   // thin gap between cells (× cell)
  static let blockR: CGFloat = 0.95 // wider gap between blocks (× cell)

  /// This device's exact screen size in pixels, read live at render time —
  /// the image matches the screen 1:1, so iOS never scales or crops it and the
  /// centered grid stays centered on every device, even if the app has never
  /// been opened. The App Group copy written by the app is only a fallback.
  static func targetSize() -> CGSize {
    let native = UIScreen.main.nativeBounds.size // pixels, portrait-up on every device
    if native.width > 300 && native.height > 600 { return native }
    let defaults = UserDefaults(suiteName: Ink.appGroup)
    let w = defaults?.integer(forKey: "wallW") ?? 0
    let h = defaults?.integer(forKey: "wallH") ?? 0
    if w > 300 && h > 600 { return CGSize(width: w, height: h) }
    return CGSize(width: 1179, height: 2556) // 6.1" 3x frame, last resort
  }

  static func render() -> UIImage {
    let size = targetSize()
    let W = size.width
    let H = size.height

    let lived = Ink.lived(Ink.birthYear())
    let cols = Ink.weeksPerYear
    let rows = Ink.lifeYears
    let hblocks = (cols - 1) / quarter // 3
    let vblocks = (rows - 1) / decade  // 7

    let bg = UIColor(Ink.bg)
    let ink = UIColor(Ink.ink)
    let pencil = UIColor(Ink.pencil)
    let dim = UIColor(Ink.dim)

    let format = UIGraphicsImageRendererFormat()
    format.scale = 1 // W/H are already device pixels
    let renderer = UIGraphicsImageRenderer(size: CGSize(width: W, height: H), format: format)

    return renderer.image { _ in
      bg.setFill()
      UIBezierPath(rect: CGRect(x: 0, y: 0, width: W, height: H)).fill()

      // symmetric margins so the grid is dead-center on every device
      let padX = W * 0.10
      let padY = H * 0.14
      let availW = W - padX * 2
      let availH = H - padY * 2

      let cellW = availW / (CGFloat(cols) + CGFloat(cols - 1) * gapR + CGFloat(hblocks) * blockR)
      let cellH = availH / (CGFloat(rows) + CGFloat(rows - 1) * gapR + CGFloat(vblocks) * blockR)
      let cell = min(cellW, cellH)
      let gap = cell * gapR
      let block = cell * blockR

      let gridW = CGFloat(cols) * cell + CGFloat(cols - 1) * gap + CGFloat(hblocks) * block
      let gridH = CGFloat(rows) * cell + CGFloat(rows - 1) * gap + CGFloat(vblocks) * block
      let x0 = (W - gridW) / 2
      let y0 = (H - gridH) / 2

      let radius = cell * 0.22
      for i in 0..<(cols * rows) {
        let c = i % cols
        let r = i / cols
        let x = x0 + CGFloat(c) * (cell + gap) + CGFloat(c / quarter) * block
        let y = y0 + CGFloat(r) * (cell + gap) + CGFloat(r / decade) * block
        let rect = CGRect(x: x, y: y, width: cell, height: cell)
        if i == lived {
          bg.setFill()
          UIBezierPath(roundedRect: rect, cornerRadius: radius).fill()
          let stroke = UIBezierPath(roundedRect: rect.insetBy(dx: cell * 0.06, dy: cell * 0.06), cornerRadius: radius)
          stroke.lineWidth = max(1, cell * 0.12)
          ink.setStroke()
          stroke.stroke()
        } else {
          (i < lived ? ink : pencil).setFill()
          UIBezierPath(roundedRect: rect, cornerRadius: radius).fill()
        }
      }

      // caption, centered in the bottom margin
      let formatter = NumberFormatter()
      formatter.numberStyle = .decimal
      let week = formatter.string(from: NSNumber(value: lived + 1)) ?? "\(lived + 1)"
      let total = formatter.string(from: NSNumber(value: cols * rows)) ?? "\(cols * rows)"
      let caption = NSAttributedString(
        string: "WEEK \(week)  /  \(total)",
        attributes: [
          .font: UIFont.monospacedSystemFont(ofSize: W * 0.028, weight: .medium),
          .foregroundColor: dim,
          .kern: W * 0.006,
        ]
      )
      let size = caption.size()
      caption.draw(at: CGPoint(x: (W - size.width) / 2, y: y0 + gridH + H * 0.045))
    }
  }
}
