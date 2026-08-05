# Screenly — InfinityFree Edition

This build is designed to be uploaded as a static website to InfinityFree.

## Files

- `index.html` — the complete website.

## Upload

1. Create your InfinityFree website.
2. Open the website's `htdocs` directory.
3. Upload `index.html` directly into `htdocs`.
4. Make sure SSL/HTTPS is enabled for the site.
5. Open the site over `https://`.

No PHP, Node.js, database, or build process is required.

## How it works

The page uses PeerJS 1.5.5 from the public CDN and the PeerJS Cloud signaling service.

The actual screen/video media uses WebRTC peer-to-peer connections. InfinityFree does not relay the video.

## Using it

Host:
1. Open the site.
2. Click Create room.
3. Click Copy invite.
4. Send the link to the viewer.
5. Click the screen button and choose what to share.

Viewer:
1. Open the invite link.
2. Wait for the host to start sharing.

## Important limitations

- The room creator is the screen-sharing host.
- This build supports multiple viewers in principle, but the host's upload bandwidth and browser performance determine how many are practical.
- WebRTC may fail on some restrictive networks because a TURN relay is not included.
- Screen capture requires HTTPS and a user interaction.
- PeerJS Cloud is an external signaling service. Its availability is not controlled by InfinityFree.
- For a production service, use your own signaling service and TURN infrastructure.

## InfinityFree note

InfinityFree provides PHP/MySQL hosting, but it does not run Node.js/custom server software. This version deliberately avoids requiring a Node server on InfinityFree.
