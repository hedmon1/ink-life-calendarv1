import Foundation
import SwiftUI

// Shared life-calendar math + palette, mirroring the RN app (calc.ts / theme.ts / LifeGrid.tsx).
// `birthYear` is written by the app into the App Group; everything else is derived here so the
// grid keeps ticking on the widget's own timeline even if the app is never reopened.

enum Ink {
  static let appGroup = "group.com.ink.lifecalendar"
  static let weeksPerYear = 52
  static let lifeYears = 80
  static let totalWeeks = 52 * 80   // 4160
  static let primeEnd = 35 * 52     // 1820
  static let defaultBirthYear = 1998

  // palette
  static let bg = Color(red: 0.031, green: 0.035, blue: 0.039)     // #08090a
  static let ink = Color(red: 0.969, green: 0.973, blue: 0.973)    // #f7f8f8
  static let pencil = Color(red: 0.102, green: 0.110, blue: 0.129) // #1a1c21
  static let gold = Color(red: 0.910, green: 0.722, blue: 0.294)   // #e8b84b
  static let dim = Color(white: 0.52)

  static func birthYear() -> Int {
    let y = UserDefaults(suiteName: appGroup)?.integer(forKey: "birthYear") ?? 0
    return (y >= 1930 && y <= 2024) ? y : defaultBirthYear
  }

  /// Weeks lived since June 15 of the birth year, clamped to [0, totalWeeks-1].
  static func lived(_ birthYear: Int, now: Date = Date()) -> Int {
    var comps = DateComponents()
    comps.year = birthYear; comps.month = 6; comps.day = 15
    let cal = Calendar(identifier: .gregorian)
    guard let birth = cal.date(from: comps) else { return 0 }
    let raw = Int(floor(now.timeIntervalSince(birth) / (7.0 * 86400.0)))
    return max(0, min(totalWeeks - 1, raw))
  }
}

enum InkCell { case inked, thisWeek, prime, pencil }

func inkCell(_ i: Int, lived: Int, prime: Bool) -> InkCell {
  if i < lived { return .inked }
  if i == lived { return .thisWeek }
  if prime && i < Ink.primeEnd { return .prime }
  return .pencil
}
