//
//  WebView.swift
//  WaterPolo
//
//  Created by Zhen Wei Yap on 08/08/2025.
//
import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let htmlFileName: String

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        let prefs = WKWebpagePreferences()
        prefs.allowsContentJavaScript = true
        config.defaultWebpagePreferences = prefs

        let webView = WKWebView(frame: .zero, configuration: config)

        // Load HTML from bundle root (no subdirectory)
        if let url = Bundle.main.url(forResource: htmlFileName, withExtension: "html") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        } else {
            print("⚠️ Could not find \(htmlFileName).html in bundle")
        }

        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
