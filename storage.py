from itertools import combinations

# Fájlok: (méret bájtban, név)
files = [
    (15116964314, "[anime4life.] Love Live! School Idol Project S1,S2+Movie (BDRip 1080p AC3)"),
    (27192149450, "LLS"),
    (7563228929, "Love Live! Nijigasaki High School Idol Club (Dual Audio eng jpn)"),
    (185254, "metadata"),
    (10274193861, "NANA (2006) ナナ"),
    (19360934021, "Solo.Leveling.S02.1080p.CR.WEB-DL.DUAL.AAC2.0.H.264-VARYG"),
    (12683197392, "[TRC] BLUE LOCK - S02 [English Dub] [CR WEB-RIP 1080p HEVC-10 AAC]"),
    (18705860742, "[Yameii] Love Live! Nijigasaki High School Idol Club - S02 [English Dub] [CR WEB-DL 1080p]")
]

# Egyetlen meghajtó (szabad hely bájtban, elérési út)
drive_free_bytes = 26355676 * 1024  # = 26 GB körül
drive_path = "/srv/dev-disk-by-uuid-55"

# Tűréshatár MB-ban – ez most nem befolyásolja, de benne hagyjuk, ha bővíted
tolerance_mb = 1000000
tolerance_bytes = tolerance_mb * 1024 * 1024

# Legjobb kombináció keresése
best_combination = None
min_waste = float('inf')

for r in range(1, len(files) + 1):
    for combo in combinations(files, r):
        total_size = sum(size for size, _ in combo)
        if total_size <= drive_free_bytes:
            waste = drive_free_bytes - total_size
            if waste < min_waste:
                min_waste = waste
                best_combination = combo

# Eredmény kiírása
if best_combination:
    print(f"✅ Legjobb fájlkombináció a meghajtóra ({drive_path}):")
    for size, name in best_combination:
        print(f"  - {name} ({size / 1024 / 1024:.2f} MB)")
    print(f"\n💾 Kihasználatlan hely maradt: {min_waste / 1024 / 1024:.2f} MB")
else:
    print("❌ Nem találtam olyan fájlkombinációt, ami elfért volna a meghajtón.")