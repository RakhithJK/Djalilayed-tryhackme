# TryHackMe Room Grand Larceny Auto https://tryhackme.com/room/grandlarcenyauto
## YouTube Video Walk Through: https://youtu.be/XSMhkBLLR9A

### option 1. without modifying the dll

```
./gdre_tools.x86_64 --headless --recover=/root/game/GrandLarcenyAuto-windows/GrandLarcenyAuto.pck --output=./project
```

```
sudo apt update
sudo apt install dotnet-sdk-8.0
```

```
dotnet new console -n FlagReader
cd FlagReader
```

```
vim FlagReader.csproj
```

```
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  
  <ItemGroup>
    <Reference Include="GrandLarcenyAuto">
      <HintPath>../data_GrandLarcenyAuto_windows_x86_64/GrandLarcenyAuto.dll</HintPath>
    </Reference>
  </ItemGroup>

</Project>
```

```
vim Program.cs
```

public int WantedStars { get; set; }

Because we are writing our own C# application to interact with the game's code directly, we don't need to hack the DLL to trick the game into thinking we have 6 stars. We can just instantiate a normal player and tell it it has 6 stars using standard C# code.

```
using System;
using GrandLarcenyAuto;

namespace FlagReader
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Initializing Player State...");
            PlayerState player = new PlayerState();
            
            // The ultimate bypass: just give ourselves the 6 stars directly!
            player.WantedStars = 6; 
            
            Console.WriteLine("Approaching Vault...");
            SafehouseVault vault = new SafehouseVault(player);
            
            Console.WriteLine("Decrypting Flag:");
            Console.WriteLine(vault.TryOpen());
        }
    }
}
```

```
dotnet run
```

# windows machine

```
 GrandLarcenyAuto → PlayerState → WantedStars → get_WantedStars
```
