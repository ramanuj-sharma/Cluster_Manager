def load_key(filename):
    with open(filename) as file:
        return [line.rstrip() for line in file][:3]

def store_key(filename, key):
    with open(filename, "w") as file:
        file.write(key[0] + "\n")
        file.write(key[1] + "\n")
        file.write(key[2])