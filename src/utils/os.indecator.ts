
// import { platform } from "os";

export const getOS = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();
  
    const androidPattern = /android|huawei/;
    const iosPattern = /iphone|ipad|ipod/;
    const windowsPattern = /windows phone|windows/;
  
    if (androidPattern.test(userAgent)) {
      return 'ANDROID';
    }
  
    if (iosPattern.test(userAgent)) {
      return 'IOS';
    }
  
    if (windowsPattern.test(userAgent)) {
      return 'WINDOWS';
    }
  
    return 'OTHER';
  };