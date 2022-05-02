

class DeviceInfo {
    static deviceNamePatterns: Array<[RegExp, string]> = [
        [/windows nt 10.0/i, 'Windows 10'],
        [/windows nt 6.2/i, 'Windows 8'],
        [/windows nt 6.1/i, 'Windows 7'],
        [/windows nt 6.0/i, 'Windows Vista'],
        [/windows nt 5.2/i, 'Windows Server 2003/XP x64'],
        [/windows nt 5.1/i, 'Windows XP'],
        [/windows xp/i, 'Windows XP'],
        [/windows nt 5.0/i, 'Windows 2000'],
        [/windows me/i, 'Windows ME'],
        [/win98/i, 'Windows 98'],
        [/win95/i, 'Windows 95'],
        [/win16/i, 'Windows 3.11'],
        [/macintosh|mac os x/i, 'Mac OS X'],
        [/mac_powerpc/i, 'Mac OS 9'],
        [/linux/i, 'Linux'],
        [/ubuntu/i, 'Ubuntu'],
        [/iphone/i, 'iPhone'],
        [/ipod/i, 'iPod'],
        [/ipad/i, 'iPad'],
        [/android/i, 'Android'],
        [/blackberry/i, 'BlackBerry'],
        [/webos/i, 'Mobile']
    ];
    
    static browserNamePatterns: Array<[RegExp, string]> = [
        [/opera/i, 'Opera'],
        [/edg/i, 'Edge'],
        [/chrome/i, 'Chrome'],
        [/safari/i, 'Safari'],
        [/firefox/i, 'Firefox'],
        [/msie/i, 'IE']
    ];
    
    static constructDeviceName(defaultName='My new device') {
    
        let name = '';
    
        const agent = navigator.userAgent;
    
        for (const [pattern, browser] of DeviceInfo.browserNamePatterns) {
            if (pattern.test(agent)) {
                name = browser + ' on ';
                break;
            }
        }
    
        for (const [pattern, os] of DeviceInfo.deviceNamePatterns) {
            if (pattern.test(agent)) {
                name = name + os;
                break;
            }
        }
    
        if (name === '') {
            name = defaultName;
        }
    
        return name;
    
    }
}

export { DeviceInfo };