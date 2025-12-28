[Setup]
AppName=Smusic
AppVersion=1.4
AppPublisher=Smusic
DefaultDirName={autopf}\Smusic
DefaultGroupName=Smusic
AllowNoIcons=yes
OutputDir=installer-output
OutputBaseFilename=Smusic-Setup-1.4
SetupIconFile=assets\icon.ico
Compression=lzma
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64
PrivilegesRequired=lowest
UninstallDisplayIcon={app}\Smusic.exe

[Languages]
Name: "chinese"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"

[Tasks]
Name: "desktopicon"; Description: "创建桌面快捷方式"; GroupDescription: "附加图标:"
Name: "quicklaunchicon"; Description: "创建快速启动栏快捷方式"; GroupDescription: "附加图标:"; Flags: unchecked

[Files]
Source: "dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Smusic"; Filename: "{app}\Smusic.exe"
Name: "{group}\卸载 Smusic"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Smusic"; Filename: "{app}\Smusic.exe"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Smusic"; Filename: "{app}\Smusic.exe"; Tasks: quicklaunchicon

[Run]
Filename: "{app}\Smusic.exe"; Description: "启动 Smusic"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
