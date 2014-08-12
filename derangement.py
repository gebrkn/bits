# generate a random derangement of a range
# ref http://local.disia.unifi.it/merlini/papers/Derangements.pdf
# http://stackoverflow.com/questions/25200220/generate-a-random-derangement-of-a-list

import random

def random_derangement(n):
    while True:
        v = range(n)
        for j in range(n - 1, -1, -1):
            p = random.randint(0, j)
            if v[p] == j:
                break
            else:
                v[j], v[p] = v[p], v[j]
        else:
            if v[0] != 0:
                return tuple(v)

# demo

N = 4

# enumerate all derangements for testing
import itertools
counter = {}
for p in itertools.permutations(range(N)):
    if all(p[i] != i for i in p):
        counter[p] = 0

# final values should be close to M
M = 5000
for _ in range(M*len(counter)):
    # generate a random derangement
    p = random_derangement(N)
    # is it really?
    assert p in counter
    # ok, record it
    counter[p] += 1

# the distribution looks uniform
for p, c in sorted(counter.items()):
    print p, c
