import SwiftUI

struct ContentView: View {
    // Matches the web app background (#f3f4f6) so there is no flash on launch.
    private let bg = Color(red: 0.953, green: 0.957, blue: 0.965)

    var body: some View {
        ZStack {
            bg.ignoresSafeArea()
            WebView()
                .ignoresSafeArea()
        }
    }
}

#Preview {
    ContentView()
}
